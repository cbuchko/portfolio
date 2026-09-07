import { ContentProps } from './types'
import { PlayerInformation } from '../player-constants'
import { useMemo, useState } from 'react'
import classNames from 'classnames'
import Image from 'next/image'
import { shuffle } from '../utils'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

type Quote = { quote: string; isValid: boolean; origin: string }
type QuoteMatchup = [Quote, Quote]

export const QuotesContent = ({ playerId, handleLevelAdvance, layout }: ContentProps) => {
  const { isMobile } = layout
  const [quotes, setQuotes] = useState<QuoteMatchup[]>([])
  const [matchupIndex, setMatchupIndex] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [displaySuccess, setDisplaySuccess] = useState(false)
  const [displayFailure, setDisplayFailure] = useState(false)
  const [isShowingOrigins, setIsShowingOrigins] = useState(false)

  //setup quotes
  useEffectInitializer(() => {
    const characterQuotes = PlayerInformation[playerId].quotes
    const trueQuotes = characterQuotes.filter((q) => q.isValid)
    const falseQuotes = characterQuotes.filter((q) => !q.isValid)
    const trueShuffled = shuffle(trueQuotes)
    const falseShuffled = shuffle(falseQuotes)
    const gameQuotes: QuoteMatchup[] = []
    for (let i = 0; i < trueShuffled.length; i++) {
      gameQuotes[i] = [trueShuffled[i], falseShuffled[i]]
    }
    setQuotes(gameQuotes)
  }, [playerId])

  const handleQuoteSelect = (isTrue: boolean) => {
    if (displayFailure || displaySuccess) return
    if (matchupIndex >= quotes.length) {
      //if for some unforseen reason the game runs out of quotes, just advance them
      handleLevelAdvance(true)
      return
    }
    if (isTrue) {
      if (successCount === 4) {
        handleLevelAdvance(true)
      }
      setSuccessCount((count) => count + 1)
      setDisplaySuccess(true)
      setTimeout(() => {
        setDisplaySuccess(false)
        setMatchupIndex((index) => index + 1)
      }, 3000)
    } else {
      handleLevelAdvance(false)
      setDisplayFailure(true)
      setTimeout(() => {
        setDisplayFailure(false)
        setMatchupIndex((index) => index + 1)
      }, 3000)
    }

    setIsShowingOrigins(true)
    setTimeout(() => setIsShowingOrigins(false), 2900)
  }

  const matchup = useMemo(() => {
    if (quotes.length === 0) return null
    return shuffle(quotes[matchupIndex])
  }, [matchupIndex, quotes])

  if (!matchup) return null
  return (
    <>
      <p className="text-lg">Which of these quotes have you said?</p>
      <div
        className={classNames('flex items-center', {
          'm-2 mt-4 flex-col gap-3': isMobile,
          'm-4 mt-8 gap-5': !isMobile,
        })}
      >
        <QuoteBox
          quote={matchup[0].quote}
          origin={matchup[0].origin}
          onClick={() => handleQuoteSelect(matchup[0].isValid)}
          displayFailure={displayFailure && !matchup[0].isValid}
          displaySuccess={displaySuccess && matchup[0].isValid}
          isShowingOrigins={isShowingOrigins}
          isMobile={isMobile}
        />
        <div
          className={classNames(
            'flex shrink-0 items-center justify-center rounded-full border-2',
            { 'h-14 w-14 text-xl': isMobile, 'h-20 w-20 text-4xl': !isMobile }
          )}
        >
          {!displaySuccess && !displayFailure && <div>OR</div>}
          {displaySuccess && (
            <Image
              src="/thirty-factor-authentication/icons/green-checkmark.svg"
              alt="check"
              width={isMobile ? 24 : 36}
              height={isMobile ? 24 : 36}
            />
          )}
          {displayFailure && (
            <Image
              src={'/thirty-factor-authentication/icons/red-x.svg'}
              width={isMobile ? 24 : 36}
              height={isMobile ? 24 : 36}
              alt="X"
            />
          )}
        </div>
        <QuoteBox
          quote={matchup[1].quote}
          origin={matchup[1].origin}
          onClick={() => handleQuoteSelect(matchup[1].isValid)}
          displayFailure={displayFailure && !matchup[1].isValid}
          displaySuccess={displaySuccess && matchup[1].isValid}
          isShowingOrigins={isShowingOrigins}
          isMobile={isMobile}
        />
      </div>
      <div className={classNames('flex justify-center', { 'mt-4 gap-3': isMobile, 'mt-8 gap-4': !isMobile })}>
        <Checkbox isChecked={successCount > 0} />
        <Checkbox isChecked={successCount > 1} />
        <Checkbox isChecked={successCount > 2} />
        <Checkbox isChecked={successCount > 3} />
        <Checkbox isChecked={successCount > 4} />
      </div>
    </>
  )
}

const QuoteBox = ({
  quote,
  origin,
  displayFailure,
  displaySuccess,
  onClick,
  isShowingOrigins,
  isMobile,
}: {
  quote: string
  origin: string
  displaySuccess: boolean
  displayFailure: boolean
  onClick: () => void
  isShowingOrigins: boolean
  isMobile?: boolean
}) => {
  return (
    <div
      onClick={onClick}
      className={classNames(
        'flex aspect-square flex-col items-center justify-center text-center border-2 cursor-pointer hover:scale-105 transition-transform',
        {
          'w-[min(220px,100%)] p-2.5 text-base': isMobile,
          'w-[min(400px,calc((100vw-12rem)/2))] p-4 text-2xl': !isMobile,
          'border-green-500': displaySuccess,
          'border-red-500': displayFailure,
        }
      )}
    >
      <div className="relative px-1">
        {`"${quote}"`}
        <div
          className={classNames(
            'absolute left-0 -bottom-8 w-full text-center text-sm transition-opacity pointer-events-none',
            {
              'opacity-0': !isShowingOrigins,
              'opacity-100': isShowingOrigins,
            }
          )}
        >
          - {origin}
        </div>
      </div>
    </div>
  )
}

const Checkbox = ({ isChecked }: { isChecked: boolean }) => {
  return (
    <div className="h-10 w-10 border-2">
      {isChecked && (
        <Image
          src="/thirty-factor-authentication/icons/green-checkmark.svg"
          alt="check"
          width={36}
          height={36}
        />
      )}
    </div>
  )
}
