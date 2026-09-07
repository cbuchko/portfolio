/**
 * Short one-shots on the shared AudioContext.
 *
 * Every `sfx` entry in the registry is fetched + decoded once, right after the
 * first user gesture unlocks audio (`preloadAll`). Playing is then a synchronous
 * `AudioBufferSourceNode.start()` — no per-play network, no `new Audio()` fallback.
 */

import { audioEngine, audioLog } from './engine'
import { getSoundDef, SFX_KEYS, SfxKey, SoundKey } from './registry'

const buffers = new Map<SoundKey, AudioBuffer>()
const inflight = new Map<SoundKey, Promise<AudioBuffer | null>>()

export type SfxHandle = { stop: () => void }

export type PlaySfxOptions = {
  /** Override the registry volume (0–1). */
  volume?: number
}

/** Fetch and decode one clip into the buffer cache. Resolves null on failure. */
export const loadBuffer = (key: SoundKey): Promise<AudioBuffer | null> => {
  const cached = buffers.get(key)
  if (cached) return Promise.resolve(cached)
  const pending = inflight.get(key)
  if (pending) return pending

  const ctx = audioEngine.getContext()
  if (!ctx) return Promise.resolve(null)

  const { src } = getSoundDef(key)
  const task = fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${src}`)
      return res.arrayBuffer()
    })
    .then(
      (bytes) =>
        new Promise<AudioBuffer>((resolve, reject) => {
          // Callback form for old Safari, which lacks the promise variant.
          ctx.decodeAudioData(bytes, resolve, reject)
        })
    )
    .then((buffer) => {
      buffers.set(key, buffer)
      return buffer
    })
    .catch((err) => {
      audioLog('decode failed', key, err)
      return null
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, task)
  return task
}

export const hasBuffer = (key: SoundKey) => buffers.has(key)

/** Drop a decoded buffer (used for large `track` clips on level exit). */
export const releaseBuffer = (key: SoundKey) => {
  buffers.delete(key)
}

/** Decode every registry `sfx` clip. Called automatically on first unlock. */
export const preloadAll = () => Promise.all(SFX_KEYS.map(loadBuffer))

let preloadArmed = false
export const armPreload = () => {
  if (preloadArmed || typeof window === 'undefined') return
  preloadArmed = true
  audioEngine.onUnlock(() => {
    preloadAll().then(() => audioLog('sfx preloaded'))
  })
}

if (typeof window !== 'undefined') armPreload()

const startSource = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  volume: number
): SfxHandle => {
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.value = Math.max(0, Math.min(1, volume))
  source.connect(gain)
  gain.connect(ctx.destination)
  source.onended = () => {
    source.disconnect()
    gain.disconnect()
  }
  source.start(0)
  return {
    stop: () => {
      try {
        source.stop()
      } catch {
        /* already ended */
      }
    },
  }
}

const playViaElement = (src: string, volume: number): SfxHandle | null => {
  try {
    const el = new Audio(src)
    el.volume = Math.max(0, Math.min(1, volume))
    el.play().catch(() => audioLog('dropped (element fallback blocked)', src))
    return { stop: () => el.pause() }
  } catch {
    return null
  }
}

/**
 * Fire-and-forget a one-shot. Returns a handle for early stop, or null when the
 * clip couldn't play synchronously (not unlocked, context frozen, still decoding).
 *
 * If the context is merely suspended (e.g. first tap after an iOS interruption) we
 * wait up to `RESUME_GRACE_MS` for it to come back, then drop the play — never queue.
 */
export const playSfx = (key: SfxKey, opts: PlaySfxOptions = {}): SfxHandle | null => {
  const ctx = audioEngine.getContext()
  if (!ctx) return null

  const def = getSoundDef(key)
  const volume = opts.volume ?? def.volume ?? 1

  // Sync fast-path: unlocked, running, decoded.
  const buffer = buffers.get(key)
  if (buffer && ctx.state === 'running') return startSource(ctx, buffer, volume)

  // Not decoded yet (very first tap before preload landed, or a cold cache). Start the
  // decode for next time and play this one through a throwaway element, which is
  // allowed because we're inside the gesture. Outside a gesture play() just rejects.
  if (!buffer) {
    if (!audioEngine.isUnlocked()) audioEngine.unlock()
    loadBuffer(key)
    return playViaElement(def.src, volume)
  }

  // Decoded but frozen — give resume() a short, bounded chance.
  let cancelled = false
  let live: SfxHandle | null = null
  audioEngine.whenRunning().then((ok) => {
    if (cancelled) return
    if (ok) live = startSource(ctx, buffer, volume)
    else audioLog('dropped (context not running)', key, ctx.state)
  })
  return {
    stop: () => {
      cancelled = true
      live?.stop()
    },
  }
}
