import { RefObject, useCallback, useEffect, useRef } from 'react'
import { ScoreProps, StatisticType } from '../../side-panel/useScore'

const videos = [
  '/idle_game/video/pizza.mp4',
  '/idle_game/video/yacht.mp4',
  '/idle_game/video/boxing.mp4',
]
const audios = [
  '/idle_game/audio/video-ads/upbeat.mp3',
  '/idle_game/audio/video-ads/hipster.mp3',
  '/idle_game/audio/video-ads/bassy.mp3',
]

const videoFrequencyInMs = 60000

export const VideoPlayer = ({
  viewRef,
  scoreProps,
}: {
  scoreProps: ScoreProps
  viewRef: RefObject<HTMLDivElement | null>
}) => {
  const currentIndex = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>(null)
  const scorePropsRef = useRef(scoreProps)

  useEffect(() => {
    scorePropsRef.current = scoreProps
  }, [scoreProps])

  const spawnVideo = useCallback(
    (index: number) => {
      const view = viewRef.current
      const video = videoRef.current

      if (!view || !video) return

      const handleEnded = () => {
        currentIndex.current = (index + 1) % videos.length
        audio.pause()
        video.style.opacity = '0'
        video.style.pointerEvents = 'none'

        //use ref to always get latest scoreProps, so we don't have to reset the interval to update these
        const { incrementScore, adPower } = scorePropsRef.current
        incrementScore(adPower, StatisticType.ad)
      }

      //randomizes where the video spawns
      const bounds = view.getBoundingClientRect()
      const { right, bottom } = bounds
      const x = right + 6
      const y = Math.random() * bottom * 0.6

      //set the content
      const videoSrc = videos[index]
      video.src = videoSrc

      //show the video
      video.style.top = y + 'px'
      video.style.left = x + 'px'
      video.style.opacity = '100'
      video.style.pointerEvents = 'all'
      video.style.display = 'visible'

      //play sfx
      const audio = new Audio(audios[index])
      audio.volume = 0.5
      audio.play()

      video.addEventListener('ended', handleEnded, { once: true })
    },
    [videoRef]
  )

  useEffect(() => {
    if (intervalRef.current !== null) return
    spawnVideo(0)
    intervalRef.current = setInterval(() => {
      spawnVideo(currentIndex.current)
    }, videoFrequencyInMs)
  }, [])

  return (
    <video
      className="absolute pointer-events-none w-[400px] rounded-md"
      ref={videoRef}
      src={videos[0]}
      autoPlay
      muted={true}
    />
  )
}
