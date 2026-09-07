'use client'

/**
 * Thin React helpers over the audio engine. All returned functions are stable
 * (safe to put in effect deps / pass to children without re-renders).
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { audioEngine, audioLog } from './engine'
import { getMusicChannel, MusicChannel, MusicPlayOptions } from './music'
import { MusicKey, SfxKey } from './registry'
import { playSfx, PlaySfxOptions } from './sfx'

/** Stable one-shot player for a registry key. */
export const useSfx = (key: SfxKey, defaults?: PlaySfxOptions) => {
  const defaultVolume = defaults?.volume
  return useCallback(
    (opts?: PlaySfxOptions) =>
      playSfx(key, defaultVolume === undefined ? opts : { volume: defaultVolume, ...opts }),
    [key, defaultVolume]
  )
}

export type UseMusicOptions = MusicPlayOptions & {
  /** Stop playback when the component unmounts. Default true. */
  stopOnUnmount?: boolean
  /** Free decoded buffers on unmount (only meaningful for `track` keys). Default true. */
  releaseOnUnmount?: boolean
}

export type UseMusicResult = {
  channel: MusicChannel
  play: (opts?: MusicPlayOptions) => Promise<boolean>
  pause: () => void
  stop: () => void
  isPlaying: () => boolean
  currentTimeMs: () => number
  durationMs: () => number
  setVolume: (volume: number) => void
  /** Subscribe to natural end-of-clip. Returns unsubscribe. */
  onEnded: (cb: () => void) => () => void
}

/**
 * Bind a component to a music channel. Warms the channel on mount and (by
 * default) stops it on unmount so leaving a level never leaves music running.
 */
export const useMusic = (key: MusicKey, options: UseMusicOptions = {}): UseMusicResult => {
  const { stopOnUnmount = true, releaseOnUnmount = true, loop, volume, restart } = options

  const channel = useMemo(() => getMusicChannel(key), [key])
  // Channels are singletons that outlive components. Timer/RAF callbacks that fire
  // after unmount must not be able to restart music nobody can stop anymore.
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    channel.prepare()
    return () => {
      mountedRef.current = false
      if (stopOnUnmount) channel.stop()
      if (releaseOnUnmount) channel.release()
    }
  }, [channel, stopOnUnmount, releaseOnUnmount])

  return useMemo<UseMusicResult>(() => {
    const defaults: MusicPlayOptions = {}
    if (loop !== undefined) defaults.loop = loop
    if (volume !== undefined) defaults.volume = volume
    if (restart !== undefined) defaults.restart = restart
    return {
      channel,
      play: (opts) => {
        if (!mountedRef.current) {
          audioLog('play ignored (component unmounted)', key)
          return Promise.resolve(false)
        }
        return channel.play({ ...defaults, ...opts })
      },
      pause: () => channel.pause(),
      stop: () => channel.stop(),
      isPlaying: () => channel.isPlaying(),
      currentTimeMs: () => channel.currentTimeMs(),
      durationMs: () => channel.durationMs(),
      setVolume: (v) => channel.setVolume(v),
      onEnded: (cb) => channel.onEnded(cb),
    }
  }, [channel, key, loop, volume, restart])
}

/** Subscribe to a channel's natural end while mounted (latest callback always used). */
export const useMusicEnded = (music: UseMusicResult, cb: () => void) => {
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  }, [cb])
  useEffect(() => music.onEnded(() => cbRef.current()), [music])
}

/** Unlock audio from a gesture handler; convenience re-export for components. */
export const unlockAudio = () => audioEngine.unlock()
