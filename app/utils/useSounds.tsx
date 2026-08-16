import { useCallback, useEffect, useRef } from 'react'

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

let sharedContext: AudioContext | null = null
const bufferCache = new Map<string, Promise<AudioBuffer>>()
let unlockBound = false

function getAudioContext(): AudioContext {
  if (!sharedContext) {
    const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext
    if (!AC) throw new Error('Web Audio API is unavailable')
    sharedContext = new AC()
  }
  return sharedContext
}

function bindAudioUnlock() {
  if (unlockBound || typeof window === 'undefined') return
  unlockBound = true

  const unlock = () => {
    try {
      const ctx = getAudioContext()
      void ctx.resume()
    } catch {
      // ignore
    }
    document.removeEventListener('pointerdown', unlock)
    document.removeEventListener('touchstart', unlock)
    document.removeEventListener('keydown', unlock)
  }

  document.addEventListener('pointerdown', unlock, { once: true, passive: true })
  document.addEventListener('touchstart', unlock, { once: true, passive: true })
  document.addEventListener('keydown', unlock, { once: true })
}

function loadBuffer(src: string): Promise<AudioBuffer> {
  let pending = bufferCache.get(src)
  if (!pending) {
    pending = (async () => {
      const response = await fetch(src)
      const data = await response.arrayBuffer()
      // slice() so decodeAudioData can take ownership on older browsers
      return getAudioContext().decodeAudioData(data.slice(0))
    })()
    bufferCache.set(src, pending)
  }
  return pending
}

/** Fire-and-forget one-shot (overlapping OK). Prefetches on first call. */
export function playSfx(src: string, volume = 1) {
  if (typeof window === 'undefined') return
  bindAudioUnlock()
  void loadBuffer(src)
    .then((buffer) => {
      const ctx = getAudioContext()
      void ctx.resume()
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const gain = ctx.createGain()
      gain.gain.value = volume
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start(0)
    })
    .catch(() => {
      // ignore decode/play failures
    })
}

/** Prefetch a buffer into the shared cache (e.g. before a level starts). */
export function prefetchSound(src: string) {
  if (typeof window === 'undefined') return
  bindAudioUnlock()
  void loadBuffer(src).catch(() => {
    // ignore
  })
}

/**
 * @param htmlAudio Force HTMLAudioElement playback. Prefer default (Web Audio) for
 *   low-latency mobile; timing APIs still work via the AudioContext clock.
 */
export function useSound(src: string, volume?: number, shouldLoop?: boolean, htmlAudio?: boolean) {
  const vol = volume ?? 1
  const loop = shouldLoop ?? false
  const useHtmlAudio = htmlAudio ?? false

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isAudioPlayingRef = useRef(false)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  /** ctx.currentTime when the current buffer source started */
  const startedAtCtxRef = useRef(0)
  const useHtmlAudioRef = useRef(useHtmlAudio)
  const volRef = useRef(vol)
  const loopRef = useRef(loop)
  useHtmlAudioRef.current = useHtmlAudio
  volRef.current = vol
  loopRef.current = loop

  useEffect(() => {
    bindAudioUnlock()

    let cancelled = false

    if (useHtmlAudio) {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.volume = vol
      audio.loop = loop
      audio.load()
      audioRef.current = audio

      return () => {
        cancelled = true
        audio.pause()
        audioRef.current = null
      }
    }

    void loadBuffer(src)
      .then((buffer) => {
        if (!cancelled) bufferRef.current = buffer
      })
      .catch(() => {
        if (cancelled) return
        const audio = new Audio(src)
        audio.preload = 'auto'
        audio.volume = vol
        audio.loop = loop
        audio.load()
        audioRef.current = audio
      })

    return () => {
      cancelled = true
      try {
        sourceRef.current?.stop()
      } catch {
        // already stopped
      }
      sourceRef.current = null
      bufferRef.current = null
      isAudioPlayingRef.current = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [src, vol, loop, useHtmlAudio])

  const playHtml = useCallback((audio: HTMLAudioElement) => {
    isAudioPlayingRef.current = true
    audio.volume = volRef.current
    audio.loop = loopRef.current
    try {
      audio.currentTime = 0
    } catch {
      // iOS can throw if not ready
    }
    void audio.play().catch(() => {
      isAudioPlayingRef.current = false
    })
  }, [])

  const playSound = useCallback(() => {
    if (useHtmlAudioRef.current) {
      const audio = audioRef.current
      if (!audio) return
      playHtml(audio)
      return
    }

    try {
      const ctx = getAudioContext()
      void ctx.resume()

      const buffer = bufferRef.current
      if (!buffer) {
        const audio = audioRef.current
        if (audio) playHtml(audio)
        else {
          const fallback = new Audio(src)
          fallback.volume = volRef.current
          audioRef.current = fallback
          playHtml(fallback)
          void loadBuffer(src).then((decoded) => {
            bufferRef.current = decoded
          })
        }
        return
      }

      try {
        sourceRef.current?.stop()
      } catch {
        // already stopped
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = loopRef.current
      const gain = ctx.createGain()
      gain.gain.value = volRef.current
      source.connect(gain)
      gain.connect(ctx.destination)
      source.onended = () => {
        if (sourceRef.current === source) {
          isAudioPlayingRef.current = false
          sourceRef.current = null
        }
      }
      sourceRef.current = source
      isAudioPlayingRef.current = true
      startedAtCtxRef.current = ctx.currentTime
      source.start(0)
    } catch {
      const audio = audioRef.current
      if (audio) playHtml(audio)
    }
  }, [playHtml, src])

  const stopSound = useCallback(() => {
    isAudioPlayingRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      try {
        audioRef.current.currentTime = 0
      } catch {
        // ignore
      }
    }
    try {
      sourceRef.current?.stop()
    } catch {
      // already stopped
    }
    sourceRef.current = null
  }, [])

  const getCurrentTimeMs = useCallback(() => {
    if (useHtmlAudioRef.current) {
      return (audioRef.current?.currentTime ?? 0) * 1000
    }

    if (sourceRef.current && isAudioPlayingRef.current) {
      try {
        const elapsed = getAudioContext().currentTime - startedAtCtxRef.current
        return Math.max(0, elapsed * 1000)
      } catch {
        return 0
      }
    }

    // HTML fallback while the buffer is still decoding
    const html = audioRef.current
    if (html && !html.paused) {
      return (html.currentTime ?? 0) * 1000
    }

    return 0
  }, [])

  const getDurationMs = useCallback(() => {
    if (bufferRef.current) return bufferRef.current.duration * 1000
    const duration = audioRef.current?.duration
    if (!duration || Number.isNaN(duration)) return 0
    return duration * 1000
  }, [])

  return { playSound, stopSound, isAudioPlayingRef, audioRef, getCurrentTimeMs, getDurationMs }
}
