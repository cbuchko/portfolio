import { useEffect, useRef, useState } from 'react'
import { ContentProps } from './types'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import classNames from 'classnames'
import { PlayerInformation } from '../player-constants'

const selectInitialPuzzleIndex = () => {
  //currently assuming every player will have three options
  return Math.floor(Math.random() * 3)
}

const maxTimeInSeconds = 59
export const IMDBContent = ({ playerId, handleLevelAdvance, isMobile }: ContentProps) => {
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
    if (searchInput.toLowerCase() === question.answer.toLowerCase()) {
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
      <div className="bg-black text-red-500 mono text-4xl my-4 p-1 text-center">
        {timer < 0
          ? '0:00'
          : '0:' + (timer.toString().length === 1 ? '0' + timer : timer.toString())}
      </div>
      <div
        className={classNames('grid grid-cols-3 gap-5 my-8', {
          '!grid-cols-2 place-items-center': isMobile,
        })}
        key={question.answer}
      >
        <HintCard title="type" hint={question.type} revealTimeoutInMs={0} className="bg-blue-100" />
        <HintCard
          title="release year"
          hint={question.date}
          revealTimeoutInMs={5000}
          className="bg-orange-100"
        />
        <HintCard
          title="genre"
          hint={question.genre}
          revealTimeoutInMs={15000}
          className="bg-green-100"
        />
        <HintCard
          title="creator"
          hint={question.creator}
          revealTimeoutInMs={25000}
          className="bg-red-100"
        />
        <HintCard
          title="starring"
          hint={question.starring}
          revealTimeoutInMs={40000}
          className="bg-yellow-100"
        />
        <HintCard
          title="synopsis"
          hint={question.synopsis}
          revealTimeoutInMs={50000}
          className="bg-purple-100"
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

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedInput(searchInput)
    }, 300)

    return () => clearTimeout(id)
  }, [searchInput])

  const fetchTMDB = async (query: string) => {
    if (!query) return
    const tmdbResult = await fetch(`/api/movies?query=${query}`)
    const body = await tmdbResult.json()
    setMovieResults(body)
  }

  useEffectInitializer(() => {
    fetchTMDB(debouncedInput)
  }, [debouncedInput])

  return (
    <div className="relative w-full">
      <TextInput
        onChange={setSearchInput}
        value={searchInput}
        onClick={() => setIsDropdownVisible(true)}
        onSubmit={handleSubmit}
        placeholder="Search for your answer..."
        className=""
      />
      {movieResults.length > 0 && isDropdownVisible && (
        <ul className="absolute bg-white h-max border w-full rounded-md mt-1 overflow-y-auto max-h-[300px]">
          {movieResults.map((title, idx) => (
            <li
              key={idx}
              className="p-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSearchInput(title)
                setIsDropdownVisible(false)
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
}: {
  title: string
  hint: string
  revealTimeoutInMs?: number
  className?: string
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
        'h-[150px] w-[150px] border rounded-md flex flex-col items-center justify-center shadow-md p-1',
        className
      )}
    >
      <>
        <p className="uppercase font-bold">{title}</p>
        <p className="text-center text-sm">{hint}</p>
      </>
      <div
        className={classNames(
          'absolute h-[148px] w-[148px] backdrop-blur-xs z-100 rounded-md transition-opacity duration-1000',
          {
            'opacity-0': isRevealed,
          }
        )}
      />
    </div>
  )
}
