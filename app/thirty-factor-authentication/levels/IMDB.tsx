import { useMemo, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import classNames from 'classnames'
import { shuffle } from '../utils'
import Image from 'next/image'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

export const IMDBContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  setIsLoading,
}: ContentProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [mediaShuffled, setMediaShuffled] = useState<{ id: string; url: string }[] | null>(null)

  const targetMediaIds = useMemo(() => PlayerInformation[playerId].imdb.sort(), [playerId])

  const validateSelect = (input: string[]) => {
    if (
      input.length === targetMediaIds.length &&
      input.sort().every((val, i) => val === targetMediaIds[i])
    ) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  useEffectInitializer(() => {
    setMediaShuffled(shuffle(media))
    setIsLoading(false)
  }, [])

  return (
    <>
      <p className="text-lg">Confirm the media you have appeared in.</p>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {mediaShuffled &&
          mediaShuffled.map((media) => (
            <MovieThumbnail
              key={media.id}
              media={media}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              validateSelect={validateSelect}
            />
          ))}
      </div>
    </>
  )
}

const MovieThumbnail = ({
  media,
  selectedIds,
  setSelectedIds,
  validateSelect,
}: {
  media: { id: string; url: string }
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  validateSelect: (ids: string[]) => void
}) => {
  const isSelected = selectedIds.includes(media.id)

  const handleSelect = () => {
    let newIds
    if (isSelected) {
      newIds = selectedIds.filter((id) => id !== media.id)
      setSelectedIds(newIds)
    } else {
      newIds = [...selectedIds, media.id]
      setSelectedIds(newIds)
    }
    validateSelect(newIds)
  }

  return (
    <Image
      key={media.id}
      src={media.url}
      alt={media.id}
      height={'200'}
      width={'150'}
      className={classNames(
        'h-[200px] w-[150px] cursor-pointer transition-transform duration-500',
        {
          'outline-6 outline-yellow-300 rounded-md scale-75 shadow-lg': isSelected,
        }
      )}
      onClick={handleSelect}
    />
  )
}

export const IMDBControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}

const media: { id: string; url: string }[] = [
  { id: 'parks', url: '/thirty-factor-authentication/imdb/parks.jpg' },
  { id: 'westwing', url: '/thirty-factor-authentication/imdb/westwing.jpg' },
  { id: 'houseofcards', url: '/thirty-factor-authentication/imdb/houseofcards.jpg' },
  { id: 'lawandorder', url: '/thirty-factor-authentication/imdb/lawandorder.jpg' },
  // { id: 'sesamestreet', url: '/thirty-factor-authentication/imdb/sesamestreet.jpg' },
  { id: 'simpsons', url: '/thirty-factor-authentication/imdb/simpsons.jpg' },
  // { id: 'rickandmorty', url: '/thirty-factor-authentication/imdb/rickandmorty.jpg' },
  { id: 'willandgrace', url: '/thirty-factor-authentication/imdb/willandgrace.jpg' },
  // { id: 'glee', url: '/thirty-factor-authentication/imdb/glee.jpg' },
  { id: 'hotones', url: '/thirty-factor-authentication/imdb/hotones.jpg' },
  // { id: 'loveboat', url: '/thirty-factor-authentication/imdb/loveboat.webp' },
  // { id: 'maskedsinger', url: '/thirty-factor-authentication/imdb/maskedsinger.avif' },
  { id: 'xfiles', url: '/thirty-factor-authentication/imdb/xfiles.jpg' },
  { id: 'jimmykimmel', url: '/thirty-factor-authentication/imdb/jimmykimmel.webp' },
  // { id: 'billyonthestreet', url: '/thirty-factor-authentication/imdb/billyonthestreet.jpg' },
]
