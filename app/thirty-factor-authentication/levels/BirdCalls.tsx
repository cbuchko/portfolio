import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { shuffle } from '../utils'
import Image from 'next/image'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { useIsMobile } from '@/app/utils/useIsMobile'
import { mobileWidthBreakpoint } from '../constants'

const selectTargetBird = () => {
  return shuffle(targetBirds)[0].id
}
export const BirdCallContent = ({ validateAdvance, cancelAdvance, setIsLoading }: ContentProps) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)

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
      <div className={classNames('flex items-center justify-between', { 'flex-col': isMobile })}>
        <p className="text-lg w-max mr-2">Identify the Bird Call</p>
        <audio
          controls
          controlsList="nodownload"
          src={`/thirty-factor-authentication/birds/${targetBird}.mp3`}
        />
      </div>
      <div
        className={classNames('grid grid-cols-3 gap-4 mt-4', {
          '!grid-cols-2 place-items-center': isMobile,
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
}: {
  bird: { id: string; url: string }
  selectedBird?: string
  setSelectedBird: React.Dispatch<React.SetStateAction<string | undefined>>
  validateSelect: (id?: string) => void
}) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)

  const isSelected = selectedBird === bird.id

  const handleSelect = () => {
    if (isSelected) {
      setSelectedBird(undefined)
    } else {
      setSelectedBird(bird.id)
    }
    validateSelect(bird.id)
  }

  const birdSize = isMobile ? 150 : 200
  return (
    <Image
      key={bird.id}
      src={bird.url}
      alt={bird.id}
      height={birdSize}
      width={birdSize}
      className={classNames(' cursor-pointer transition-transform duration-500', {
        'outline-6 outline-yellow-300 rounded-md scale-75 shadow-lg': isSelected,
      })}
      style={{ height: birdSize, width: birdSize }}
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
