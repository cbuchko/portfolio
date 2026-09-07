/**
 * Long-form playback.
 *
 * - `music` keys stream through one reusable HTMLAudioElement per key. No decode,
 *   so a 5 MB track costs nothing in RAM and starts as soon as the first chunk lands.
 * - `track` keys decode into an AudioBuffer so `currentTimeMs()` runs off the
 *   sample-accurate `AudioContext.currentTime` (rhythm game). Buffer is released
 *   with `release()` on level exit.
 *
 * Both implement the same `MusicChannel` interface so consumers don't care.
 */

import { audioEngine, audioLog } from './engine'
import { getSoundDef, MusicKey, MUSIC_KEYS } from './registry'
import { loadBuffer, releaseBuffer } from './sfx'

export type MusicPlayOptions = {
  loop?: boolean
  volume?: number
  /** Restart from 0 even if already playing / paused mid-way. Default true. */
  restart?: boolean
}

export interface MusicChannel {
  readonly key: MusicKey
  /** Resolves true if playback actually started. */
  play(opts?: MusicPlayOptions): Promise<boolean>
  pause(): void
  /** Pause and rewind. */
  stop(): void
  isPlaying(): boolean
  currentTimeMs(): number
  durationMs(): number
  setVolume(volume: number): void
  /** Subscribe to natural end-of-clip (not fired on stop/pause). Returns unsubscribe. */
  onEnded(cb: () => void): () => void
  /** Warm the network / decode cache so play() is immediate. */
  prepare(): void
  /** Free anything heavy (buffers). Element channels just stop. */
  release(): void
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// ---------------------------------------------------------------------------
// HTMLAudioElement-backed channel
// ---------------------------------------------------------------------------

class ElementChannel implements MusicChannel {
  readonly key: MusicKey
  private el: HTMLAudioElement | null = null
  private wantsPlaying = false
  private endedListeners = new Set<() => void>()
  private detachResume: (() => void) | null = null

  constructor(key: MusicKey) {
    this.key = key
  }

  private element(): HTMLAudioElement | null {
    if (this.el) return this.el
    if (typeof window === 'undefined') return null
    const def = getSoundDef(this.key)
    const el = new Audio()
    el.preload = 'none'
    el.src = def.src
    el.loop = !!def.loop
    el.volume = clamp01(def.volume ?? 1)
    el.addEventListener('ended', () => {
      if (el.loop) return
      this.wantsPlaying = false
      this.endedListeners.forEach((cb) => cb())
    })
    el.addEventListener('error', () => audioLog('element error', this.key, el.error?.code))
    this.el = el
    return el
  }

  /** Called from the engine on first unlock: touching load() in a gesture is the
   *  historical iOS trick that lets this element play later from a timer. */
  prime() {
    const el = this.element()
    if (!el) return
    try {
      el.load()
    } catch {
      /* ignore */
    }
  }

  prepare() {
    const el = this.element()
    if (!el) return
    if (el.preload !== 'auto') {
      el.preload = 'auto'
      // Setting preload after src doesn't always kick the fetch — load() does.
      if (el.readyState === 0) {
        try {
          el.load()
        } catch {
          /* ignore */
        }
      }
    }
  }

  async play(opts: MusicPlayOptions = {}): Promise<boolean> {
    const el = this.element()
    if (!el) return false
    const def = getSoundDef(this.key)
    el.loop = opts.loop ?? !!def.loop
    el.volume = clamp01(opts.volume ?? def.volume ?? 1)
    if (opts.restart ?? true) {
      try {
        el.currentTime = 0
      } catch {
        /* metadata not loaded yet — starts at 0 anyway */
      }
    }
    this.wantsPlaying = true
    this.attachResume()
    audioEngine.unlock()
    try {
      await el.play()
      return true
    } catch (err) {
      // AbortError = we paused before it started; NotAllowedError = no gesture yet.
      audioLog('play blocked', this.key, (err as Error)?.name)
      this.wantsPlaying = false
      return false
    }
  }

  pause() {
    this.wantsPlaying = false
    this.el?.pause()
  }

  stop() {
    this.pause()
    if (this.el) {
      try {
        this.el.currentTime = 0
      } catch {
        /* ignore */
      }
    }
  }

  isPlaying() {
    const el = this.el
    return !!el && !el.paused && !el.ended
  }

  currentTimeMs() {
    return (this.el?.currentTime ?? 0) * 1000
  }

  durationMs() {
    const d = this.el?.duration
    return d && Number.isFinite(d) ? d * 1000 : 0
  }

  setVolume(volume: number) {
    if (this.el) this.el.volume = clamp01(volume)
  }

  onEnded(cb: () => void) {
    this.endedListeners.add(cb)
    return () => {
      this.endedListeners.delete(cb)
    }
  }

  /** Nothing heavy to free for a streamed element; just drop lifecycle hooks if idle. */
  release() {
    if (this.wantsPlaying) return
    this.detachResume?.()
    this.detachResume = null
  }

  // iOS pauses <audio> when the app backgrounds and does not resume it. If we still
  // want to be playing when the engine comes back, kick play() again.
  private attachResume() {
    if (this.detachResume) return
    const onResume = () => {
      const el = this.el
      if (!el || !this.wantsPlaying || !el.paused) return
      el.play().catch(() => undefined)
    }
    const offEngine = audioEngine.onResume(onResume)
    const onVisible = () => {
      if (document.visibilityState === 'visible') onResume()
    }
    document.addEventListener('visibilitychange', onVisible)
    this.detachResume = () => {
      offEngine()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }
}

// ---------------------------------------------------------------------------
// AudioBuffer-backed channel (precise clock)
// ---------------------------------------------------------------------------

class BufferChannel implements MusicChannel {
  readonly key: MusicKey
  private source: AudioBufferSourceNode | null = null
  private gain: GainNode | null = null
  private startedAt = 0 // ctx.currentTime when the current source started
  private offsetSec = 0 // where in the buffer that start corresponds to
  private playing = false
  private endedListeners = new Set<() => void>()
  private playToken = 0

  constructor(key: MusicKey) {
    this.key = key
  }

  prepare() {
    loadBuffer(this.key)
  }

  async play(opts: MusicPlayOptions = {}): Promise<boolean> {
    const ctx = audioEngine.getContext()
    if (!ctx) return false
    const token = ++this.playToken
    audioEngine.unlock()

    const def = getSoundDef(this.key)
    const restart = opts.restart ?? true
    const buffer = await loadBuffer(this.key)
    if (!buffer || token !== this.playToken) return false
    const running = await audioEngine.whenRunning(2000)
    if (!running || token !== this.playToken) {
      audioLog('track dropped (context not running)', this.key)
      return false
    }

    this.teardownSource()
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = opts.loop ?? !!def.loop
    const gain = ctx.createGain()
    gain.gain.value = clamp01(opts.volume ?? def.volume ?? 1)
    source.connect(gain)
    gain.connect(ctx.destination)

    const offset = restart ? 0 : Math.min(this.offsetSec, buffer.duration)
    source.onended = () => {
      if (this.source !== source) return // superseded or stopped manually
      this.playing = false
      this.offsetSec = 0
      this.endedListeners.forEach((cb) => cb())
    }
    source.start(0, offset)
    this.source = source
    this.gain = gain
    this.startedAt = ctx.currentTime
    this.offsetSec = offset
    this.playing = true
    return true
  }

  private teardownSource() {
    const source = this.source
    this.source = null
    if (source) {
      source.onended = null
      try {
        source.stop()
      } catch {
        /* already stopped */
      }
      source.disconnect()
    }
    this.gain?.disconnect()
    this.gain = null
  }

  pause() {
    if (this.playing) this.offsetSec = this.currentTimeMs() / 1000
    this.playToken++
    this.playing = false
    this.teardownSource()
  }

  stop() {
    this.pause()
    this.offsetSec = 0
  }

  isPlaying() {
    return this.playing
  }

  currentTimeMs() {
    if (!this.playing) return this.offsetSec * 1000
    const ctx = audioEngine.getContext()
    if (!ctx) return 0
    return (this.offsetSec + (ctx.currentTime - this.startedAt)) * 1000
  }

  durationMs() {
    return (this.source?.buffer?.duration ?? 0) * 1000
  }

  setVolume(volume: number) {
    if (this.gain) this.gain.gain.value = clamp01(volume)
  }

  onEnded(cb: () => void) {
    this.endedListeners.add(cb)
    return () => {
      this.endedListeners.delete(cb)
    }
  }

  release() {
    this.stop()
    releaseBuffer(this.key)
  }
}

// ---------------------------------------------------------------------------

const channels = new Map<MusicKey, MusicChannel>()

export const getMusicChannel = (key: MusicKey): MusicChannel => {
  const existing = channels.get(key)
  if (existing) return existing
  const def = getSoundDef(key)
  const channel: MusicChannel = def.kind === 'track' ? new BufferChannel(key) : new ElementChannel(key)
  channels.set(key, channel)
  return channel
}

/** Stop every channel — used when the run resets. */
export const stopAllMusic = () => {
  channels.forEach((c) => c.stop())
}

// Prime every element channel synchronously inside the first gesture so later
// timer-driven play() calls (bomb ticking, siren) are allowed on older iOS.
if (typeof window !== 'undefined') {
  const off = audioEngine.onGesture(() => {
    off()
    for (const key of MUSIC_KEYS) {
      const channel = getMusicChannel(key)
      if (channel instanceof ElementChannel) channel.prime()
    }
  })
}
