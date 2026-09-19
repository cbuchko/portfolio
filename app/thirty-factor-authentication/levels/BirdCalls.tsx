import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { shuffle } from '../utils'
import Image from 'next/image'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

const selectTargetBird = () => {
  return shuffle(targetBirds)[0].id
}
export const BirdCallContent = ({
  validateAdvance,
  cancelAdvance,
  setIsLoading,
  layout,
}: ContentProps) => {
  const { isNarrow, fit } = layout
  // Desktop thumbs hug a 3×3 grid instead of stretching across the card.
  const birdSize = Math.round(Math.max(100, 140 * fit))
  const [selectedBird, setSelectedBird] = useState<string>()
  const [birdsShuffled, setBirdsShuffled] = useState<{ id: string; url: string }[] | null>(null)
  const [targetBird, setTargetBird] = useState<string>()
  const validateSelect = (input?: string) => {
    if (input === targetBird) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  useEffectInitializer(() => {
    setBirdsShuffled(shuffle(birds))
    setTargetBird(selectTargetBird())
    setIsLoading(false)
  }, [setIsLoading])

  return (
    <>
      <div className={classNames('flex items-center justify-between', { 'flex-col': isNarrow })}>
        <p className="text-lg w-max mr-2">Identify the Bird Call</p>
        <audio
          controls
          controlsList="nodownload"
          src={`/thirty-factor-authentication/birds/${targetBird}.mp3`}
        />
      </div>
      <div
        className={classNames('grid grid-cols-3', {
          'mt-2 w-full gap-2': isNarrow,
          'mx-auto mt-3 w-max max-w-full gap-3': !isNarrow,
        })}
      >
        {birdsShuffled &&
          birdsShuffled.map((bird) => (
            <BirdThumbnail
              key={bird.id}
              bird={bird}
              selectedBird={selectedBird}
              setSelectedBird={setSelectedBird}
              validateSelect={validateSelect}
              isNarrow={isNarrow}
              birdSize={birdSize}
            />
          ))}
      </div>
    </>
  )
}

const BirdThumbnail = ({
  bird,
  selectedBird,
  setSelectedBird,
  validateSelect,
  isNarrow,
  birdSize,
}: {
  bird: { id: string; url: string }
  selectedBird?: string
  setSelectedBird: React.Dispatch<React.SetStateAction<string | undefined>>
  validateSelect: (id?: string) => void
  isNarrow: boolean
  birdSize: number
}) => {
  const isSelected = selectedBird === bird.id

  const handleSelect = () => {
    if (isSelected) {
      setSelectedBird(undefined)
    } else {
      setSelectedBird(bird.id)
    }
    validateSelect(bird.id)
  }

  return (
    <Image
      key={bird.id}
      src={bird.url}
      alt={bird.id}
      height={200}
      width={200}
      className={classNames(
        'aspect-square cursor-pointer object-cover transition-transform duration-500',
        {
          'h-auto w-full': isNarrow,
          'outline-6 outline-yellow-300 rounded-md scale-75 shadow-lg': isSelected,
        }
      )}
      style={isNarrow ? undefined : { height: birdSize, width: birdSize }}
      onClick={handleSelect}
    />
  )
}

export const BirdCallControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}

const birds: { id: string; url: string }[] = [
  { id: 'blackbird', url: '/thirty-factor-authentication/birds/blackbird.jpg' },
  { id: 'bluejay', url: '/thirty-factor-authentication/birds/bluejay.webp' },
  { id: 'cardinal', url: '/thirty-factor-authentication/birds/cardinal.jpg' },
  { id: 'crow', url: '/thirty-factor-authentication/birds/crow.jpg' },
  { id: 'dove', url: '/thirty-factor-authentication/birds/dove.jpeg' },
  { id: 'robin', url: '/thirty-factor-authentication/birds/robin.jpg' },
  { id: 'seagull', url: '/thirty-factor-authentication/birds/seagull.webp' },
  { id: 'sparrow', url: '/thirty-factor-authentication/birds/sparrow.jpg' },
  { id: 'wren', url: '/thirty-factor-authentication/birds/wren.jpg' },
]

const targetBirds: { id: string; url: string }[] = [
  { id: 'blackbird', url: '/thirty-factor-authentication/birds/blackbird.jpg' },
  { id: 'bluejay', url: '/thirty-factor-authentication/birds/bluejay.webp' },
  { id: 'cardinal', url: '/thirty-factor-authentication/birds/cardinal.jpg' },
  { id: 'dove', url: '/thirty-factor-authentication/birds/dove.jpeg' },
  { id: 'robin', url: '/thirty-factor-authentication/birds/robin.jpg' },
  { id: 'wren', url: '/thirty-factor-authentication/birds/wren.jpg' },
]
