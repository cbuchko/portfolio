import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const playlist = [
    '/idle_game/audio/jazz.mp3',
    '/idle_game/audio/lofi.mp3',
    '/idle_game/audio/bossa-nova.mp3',
    '/idle_game/audio/cafe.mp3',
  ]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setCurrentIndex((i) => (i + 1) % playlist.length)
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [playlist.length])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.src = playlist[currentIndex]
      audio.volume = 0.1
      audio.play()
    }
  }, [currentIndex])

  return (
    <div>
      <audio ref={audioRef} controls={false} />
    </div>
  )
}
