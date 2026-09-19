import { useEffect, useRef, useState } from 'react'
import { ContentProps } from './types'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import classNames from 'classnames'
import { PlayerInformation } from '../player-constants'

const foldTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const selectInitialPuzzleIndex = () => {
  //currently assuming every player will have three options
  return Math.floor(Math.random() * 3)
}

const maxTimeInSeconds = 59
export const IMDBContent = ({ playerId, handleLevelAdvance, layout }: ContentProps) => {
  const { isNarrow, isShort, fit } = layout
  // Cards keep their 150px width (synopses were abridged for it); only height gives.
  const cardHeight = Math.max(120, Math.round(150 * fit))
  const [timer, setTimer] = useState(maxTimeInSeconds)
  const [searchInput, setSearchInput] = useState('')
  const [questionIndex, setQuestionIndex] = useState<number | null>(null)
  const [isShowingError, setIsShowingError] = useState(false)

  const question = PlayerInformation[playerId].imdb[questionIndex || 0]

  //countdown
  const timerRef = useRef<NodeJS.Timeout>(null)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((time) => time - 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffectInitializer(() => {
    if (timer === 0) {
      handleLevelAdvance()
      setTimer(maxTimeInSeconds)
      setSearchInput('')
      setQuestionIndex((prevIndex) => ((prevIndex || 0) + 1) % 3)
    }
  }, [timer])

  const handleSubmit = () => {
    if (foldTitle(searchInput) === foldTitle(question.answer)) {
      handleLevelAdvance(true)
    } else {
      setIsShowingError(true)
      setTimeout(() => setIsShowingError(false), 3000)
    }
  }

  useEffectInitializer(() => {
    setQuestionIndex(selectInitialPuzzleIndex())
  }, [])

  return (
    <>
      <p className="text-lg">{`Confirm the title of this piece of media you've appeared in.`}</p>
      <p className="text-lg">You have unlimited attempts until the time runs out.</p>
      <div
        className={classNames('bg-black text-red-500 mono p-1 text-center', {
          'text-4xl my-4': !isShort,
          'text-2xl my-2': isShort,
        })}
      >
        {timer < 0
          ? '0:00'
          : '0:' + (timer.toString().length === 1 ? '0' + timer : timer.toString())}
      </div>
      <div
        className={classNames('grid grid-cols-3 tfa-gap-y', {
          '!grid-cols-2 place-items-center': isNarrow,
          'gap-5': !isShort,
          'gap-3': isShort,
        })}
        key={question.answer}
      >
        <HintCard
          title="type"
          hint={question.type}
          revealTimeoutInMs={0}
          className="bg-blue-100"
          height={cardHeight}
        />
        <HintCard
          title="release year"
          hint={question.date}
          revealTimeoutInMs={5000}
          className="bg-orange-100"
          height={cardHeight}
        />
        <HintCard
          title="genre"
          hint={question.genre}
          revealTimeoutInMs={15000}
          className="bg-green-100"
          height={cardHeight}
        />
        <HintCard
          title="creator"
          hint={question.creator}
          revealTimeoutInMs={25000}
          className="bg-red-100"
          height={cardHeight}
        />
        <HintCard
          title="starring"
          hint={question.starring}
          revealTimeoutInMs={40000}
          className="bg-yellow-100"
          height={cardHeight}
        />
        <HintCard
          title="synopsis"
          hint={question.synopsis}
          revealTimeoutInMs={50000}
          className="bg-purple-100"
          height={cardHeight}
        />
      </div>
      <div className="flex gap-2">
        <MovieSearch
          handleSubmit={handleSubmit}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
        <button className="auth-button auth-button-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>
      <p
        className={classNames(
          'mt-2 text-red-500 transition-opacity duration-500 pointer-events-none',
          {
            'opacity-0': !isShowingError,
            'opacity-100': isShowingError,
          }
        )}
      >
        Wrong answer, please try again.
      </p>
    </>
  )
}

const MovieSearch = ({
  searchInput,
  setSearchInput,
  handleSubmit,
}: {
  searchInput: string
  setSearchInput: (input: string) => void
  handleSubmit: () => void
}) => {
  const [movieResults, setMovieResults] = useState<Array<string>>([])
  const [debouncedInput, setDebouncedInput] = useState(searchInput)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedInput(searchInput)
    }, 300)

    return () => clearTimeout(id)
  }, [searchInput])

  useEffect(() => {
    if (!isDropdownVisible) return

    const dismissIfOutside = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsDropdownVisible(false)
      }
    }

    document.addEventListener('pointerdown', dismissIfOutside)
    return () => document.removeEventListener('pointerdown', dismissIfOutside)
  }, [isDropdownVisible])

  const fetchTMDB = async (query: string) => {
    if (!query) {
      setMovieResults([])
      return
    }
    try {
      const tmdbResult = await fetch(`/api/movies?query=${encodeURIComponent(query)}`)
      const body = await tmdbResult.json()
      const titles = Array.isArray(body) ? body : []
      setMovieResults(titles)
    } catch {
      setMovieResults([])
    }
  }

  useEffectInitializer(() => {
    fetchTMDB(debouncedInput)
  }, [debouncedInput])

  const pickTitle = (title: string) => {
    setSearchInput(title)
    setIsDropdownVisible(false)
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <TextInput
        onChange={(value) => {
          setSearchInput(value)
          setIsDropdownVisible(true)
        }}
        value={searchInput}
        onClick={() => setIsDropdownVisible(true)}
        onFocus={() => setIsDropdownVisible(true)}
        onSubmit={handleSubmit}
        placeholder="Search for your answer..."
        className=""
      />
      {movieResults.length > 0 && isDropdownVisible && (
        <ul
          className="absolute bottom-full z-10 mb-1 max-h-[240px] w-full overflow-y-auto rounded-md border bg-white"
        >
          {movieResults.map((title, idx) => (
            <li
              key={idx}
              className="p-2 py-3 min-h-11 hover:bg-gray-100 cursor-pointer"
              onPointerDown={(e) => {
                e.preventDefault()
                pickTitle(title)
              }}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const HintCard = ({
  title,
  hint,
  revealTimeoutInMs = 5000,
  className,
  height,
}: {
  title: string
  hint: string
  revealTimeoutInMs?: number
  className?: string
  height: number
}) => {
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setIsRevealed(true)
    }, revealTimeoutInMs)

    return () => {
      clearTimeout(id)
    }
  }, [revealTimeoutInMs])

  return (
    <div
      className={classNames(
        'relative w-[150px] border rounded-md flex flex-col items-center justify-center shadow-md p-1 overflow-hidden',
        className
      )}
      style={{ height }}
    >
      <>
        <p className="uppercase font-bold">{title}</p>
        <p
          className={classNames('text-center', {
            'text-sm': height >= 150,
            'text-xs': height < 150,
          })}
        >
          {hint}
        </p>
      </>
      <div
        className={classNames(
          'absolute inset-0 backdrop-blur-xs rounded-md transition-opacity duration-1000',
          {
            'opacity-0': isRevealed,
          }
        )}
      />
    </div>
  )
}
