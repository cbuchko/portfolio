import { useEffect, useRef } from 'react'

export function useSound(src: string, volume?: number) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.load()
    audio.volume = volume || 1
    audioRef.current = audio
  }, [src, volume])

  return () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play()
  }
}
