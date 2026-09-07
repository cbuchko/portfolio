/**
 * Shared audio engine (singleton, no React).
 *
 * Owns the one AudioContext, the "unlocked" flag, the iOS audio session, and
 * every lifecycle hook that can silently freeze audio on mobile:
 *
 * - context `suspended` (never resumed, or Chrome autoplay policy)
 * - context `interrupted` (iOS: tab switch, lock screen, phone call, Siri)
 * - page hidden / shown (bfcache `pageshow`, `visibilitychange`)
 * - `navigator.audioSession` state changes
 *
 * Nothing here queues plays. Sound modules ask `whenRunning()` for a short,
 * bounded window; if the context can't run in that window the play is dropped
 * so we never get the "burst of stale sounds on the next tap" behaviour.
 */

/** Extra states/APIs that aren't in lib.dom yet. */
type ExtendedContextState = AudioContextState | 'interrupted'

type AudioSessionType =
  | 'auto'
  | 'playback'
  | 'transient'
  | 'transient-solo'
  | 'ambient'
  | 'play-and-record'

interface AudioSessionLike extends EventTarget {
  type: AudioSessionType
  state: 'active' | 'interrupted' | 'inactive'
}

type NavigatorWithAudioSession = Navigator & { audioSession?: AudioSessionLike }

type WindowWithLegacyContext = Window & {
  webkitAudioContext?: typeof AudioContext
}

export const isDev = process.env.NODE_ENV !== 'production'

export const audioLog = (...args: unknown[]) => {
  if (isDev) console.info('[audio]', ...args)
}

/** Upper bound on how long a play will wait for a suspended context to resume. */
export const RESUME_GRACE_MS = 300

type Listener = () => void

const GESTURE_EVENTS = ['pointerdown', 'touchend', 'keydown'] as const

class AudioEngine {
  private ctx: AudioContext | null = null
  private unlocked = false
  private lifecycleInstalled = false
  private gestureListenersInstalled = false
  private resumeListeners = new Set<Listener>()
  private unlockListeners = new Set<Listener>()
  private gestureListeners = new Set<Listener>()

  /** True once a real gesture has successfully started the context. */
  isUnlocked() {
    return this.unlocked
  }

  isRunning() {
    return this.state() === 'running'
  }

  /** Lazily create the shared context. Null during SSR / unsupported browsers. */
  getContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    if (typeof window === 'undefined') return null
    const Ctor = window.AudioContext ?? (window as WindowWithLegacyContext).webkitAudioContext
    if (!Ctor) return null
    try {
      this.ctx = new Ctor({ latencyHint: 'interactive' })
    } catch {
      return null
    }
    this.ctx.addEventListener('statechange', this.handleStateChange)
    this.installLifecycle()
    return this.ctx
  }

  /**
   * Arm the capture-phase gesture safety net. The first pointer/key event anywhere
   * unlocks audio even if no level called `unlock()` itself.
   */
  arm() {
    this.installGestureListeners()
  }

  /**
   * Call synchronously inside a real user gesture (click / pointerdown / keydown).
   * Idempotent and cheap once unlocked; safe to call on every tap.
   */
  unlock(): void {
    if (typeof window === 'undefined') return
    this.applyAudioSession()
    // Synchronous hooks that must run inside the gesture (element priming).
    this.gestureListeners.forEach((cb) => cb())

    const ctx = this.getContext()
    if (!ctx) return

    if (ctx.state === 'running') {
      this.markUnlocked()
      return
    }

    // Legacy iOS needs an actual (silent) source started inside the gesture.
    this.playSilentTick(ctx)
    ctx.resume().then(
      () => this.markUnlocked(),
      () => undefined
    )
    // Some browsers flip state before the promise resolves; catch that too.
    this.installGestureListeners()
  }

  /** Fires once on the first successful unlock (immediately if already unlocked). */
  onUnlock(cb: Listener): () => void {
    if (this.unlocked) {
      cb()
      return () => undefined
    }
    this.unlockListeners.add(cb)
    return () => this.unlockListeners.delete(cb)
  }

  /**
   * Runs synchronously inside every `unlock()` call, i.e. inside the user gesture.
   * For work that must happen in-gesture (priming media elements). Returns unsubscribe.
   */
  onGesture(cb: Listener): () => void {
    this.gestureListeners.add(cb)
    return () => this.gestureListeners.delete(cb)
  }

  /** Fires after the context returns to `running` from a frozen state. */
  onResume(cb: Listener): () => void {
    this.resumeListeners.add(cb)
    return () => this.resumeListeners.delete(cb)
  }

  /**
   * Treat any state other than running/closed as frozen and try to thaw it.
   * Works outside a gesture once the document has sticky user activation.
   */
  resumeIfNeeded(): void {
    const ctx = this.ctx
    if (!ctx) return
    const state = this.state()
    if (state === 'running' || state === 'closed') return
    ctx.resume().catch(() => undefined)
  }

  /**
   * Resolve `true` once the context is running, or `false` if it couldn't be
   * started within `graceMs`. Never waits indefinitely.
   */
  whenRunning(graceMs = RESUME_GRACE_MS): Promise<boolean> {
    const ctx = this.getContext()
    if (!ctx) return Promise.resolve(false)
    if (ctx.state === 'running') return Promise.resolve(true)
    if (this.state() === 'closed') return Promise.resolve(false)

    return new Promise<boolean>((resolve) => {
      let settled = false
      const finish = (ok: boolean) => {
        if (settled) return
        settled = true
        ctx.removeEventListener('statechange', onChange)
        clearTimeout(timer)
        resolve(ok)
      }
      const onChange = () => {
        if (ctx.state === 'running') finish(true)
      }
      const timer = setTimeout(() => finish(false), graceMs)
      ctx.addEventListener('statechange', onChange)
      ctx.resume().then(onChange, () => undefined)
    })
  }

  // ---------------------------------------------------------------------------

  private state(): ExtendedContextState | 'none' {
    return (this.ctx?.state as ExtendedContextState | undefined) ?? 'none'
  }

  private markUnlocked() {
    if (this.unlocked || this.state() !== 'running') return
    this.unlocked = true
    audioLog('unlocked')
    this.removeGestureListeners()
    this.unlockListeners.forEach((cb) => cb())
    this.unlockListeners.clear()
  }

  private handleStateChange = () => {
    const state = this.state()
    audioLog('statechange →', state)
    if (state === 'running') {
      this.markUnlocked()
      this.resumeListeners.forEach((cb) => cb())
      return
    }
    if (!this.unlocked) return
    // iOS moves to 'interrupted' on lock/call/tab switch. Try to come back as soon as
    // the page is visible; if that fails the gesture safety net catches the next tap.
    if (state === 'interrupted' || state === 'suspended') {
      if (document.visibilityState === 'visible') this.resumeIfNeeded()
      this.installGestureListeners()
    }
  }

  private installLifecycle() {
    if (this.lifecycleInstalled || typeof window === 'undefined') return
    this.lifecycleInstalled = true

    const onVisible = () => {
      if (document.visibilityState === 'visible') this.resumeIfNeeded()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onVisible)
    window.addEventListener('focus', onVisible)

    const session = (navigator as NavigatorWithAudioSession).audioSession
    session?.addEventListener('statechange', () => {
      audioLog('audioSession →', session.state)
      if (session.state === 'active') this.resumeIfNeeded()
    })
  }

  private applyAudioSession() {
    const session = (navigator as NavigatorWithAudioSession).audioSession
    if (!session) return
    try {
      // 'playback' = media semantics: ignores the iOS hardware silent switch and keeps
      // Web Audio and <audio> elements in the same session category.
      if (session.type !== 'playback') session.type = 'playback'
    } catch {
      /* not writable on this browser */
    }
  }

  private playSilentTick(ctx: AudioContext) {
    try {
      const source = ctx.createBufferSource()
      source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
      source.connect(ctx.destination)
      source.start(0)
    } catch {
      /* ignore */
    }
  }

  private gestureHandler = () => {
    this.unlock()
    if (this.isRunning()) this.removeGestureListeners()
  }

  private installGestureListeners() {
    if (this.gestureListenersInstalled || typeof window === 'undefined') return
    this.gestureListenersInstalled = true
    for (const type of GESTURE_EVENTS) {
      window.addEventListener(type, this.gestureHandler, { capture: true, passive: true })
    }
  }

  private removeGestureListeners() {
    if (!this.gestureListenersInstalled) return
    this.gestureListenersInstalled = false
    for (const type of GESTURE_EVENTS) {
      window.removeEventListener(type, this.gestureHandler, { capture: true })
    }
  }
}

export const audioEngine = new AudioEngine()

// Arm the safety net as soon as the module loads in a browser so the first tap on
// the page unlocks audio even before any level mounts.
if (typeof window !== 'undefined') audioEngine.arm()
