import { useCallback, useEffect, useRef } from 'react'

export function useSound(src: string, volume?: number, shouldLoop?: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isAudioPlayingRef = useRef(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.load()
    audio.volume = volume || 1
    if (shouldLoop) audio.loop = true
    audioRef.current = audio

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [src, volume, shouldLoop])

  const playSound = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    isAudioPlayingRef.current = true
    audio.currentTime = 0
    void audio.play()
  }, [])

  const stopSound = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    isAudioPlayingRef.current = false
    audio.pause()
  }, [])

  const getCurrentTimeMs = useCallback(() => {
    return (audioRef.current?.currentTime ?? 0) * 1000
  }, [])

  const getDurationMs = useCallback(() => {
    const duration = audioRef.current?.duration
    if (!duration || Number.isNaN(duration)) return 0
    return duration * 1000
  }, [])

  return { playSound, stopSound, isAudioPlayingRef, audioRef, getCurrentTimeMs, getDurationMs }
}
