import { ContentProps } from './types'
import { PlayerInformation } from '../player-constants'
import { useMemo, useState } from 'react'
import classNames from 'classnames'
import Image from 'next/image'
import { shuffle } from '../utils'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { useIsMobile } from '@/app/utils/useIsMobile'
import { mobileWidthBreakpoint } from '../constants'

type Quote = { quote: string; isValid: boolean; origin: string }
type QuoteMatchup = [Quote, Quote]

export const QuotesContent = ({ playerId, handleLevelAdvance }: ContentProps) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)

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
      <div className={classNames('flex gap-5 m-4 mt-8 items-center', { 'flex-col': isMobile })}>
        <QuoteBox
          quote={matchup[0].quote}
          origin={matchup[0].origin}
          onClick={() => handleQuoteSelect(matchup[0].isValid)}
          displayFailure={displayFailure && !matchup[0].isValid}
          displaySuccess={displaySuccess && matchup[0].isValid}
          isShowingOrigins={isShowingOrigins}
        />
        <div className="w-[80px] h-[80px] flex items-center justify-center text-4xl border-2 p-4 rounded-full">
          {!displaySuccess && !displayFailure && <div>OR</div>}
          {displaySuccess && (
            <Image
              src="/thirty-factor-authentication/icons/green-checkmark.svg"
              alt="check"
              width={36}
              height={36}
            />
          )}
          {displayFailure && (
            <div className="text-red-500 h-[36px] w-[36px]">
              <Image
                src={'/thirty-factor-authentication/icons/red-x.svg'}
                width={36}
                height={36}
                alt="X"
              />
            </div>
          )}
        </div>
        <QuoteBox
          quote={matchup[1].quote}
          origin={matchup[1].origin}
          onClick={() => handleQuoteSelect(matchup[1].isValid)}
          displayFailure={displayFailure && !matchup[1].isValid}
          displaySuccess={displaySuccess && matchup[1].isValid}
          isShowingOrigins={isShowingOrigins}
        />
      </div>
      <div className="flex gap-4 justify-center mt-8">
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
}: {
  quote: string
  origin: string
  displaySuccess: boolean
  displayFailure: boolean
  onClick: () => void
  isShowingOrigins: boolean
}) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)

  return (
    <div
      onClick={onClick}
      className={classNames(
        'w-[400px] h-[400px] flex flex-col items-center justify-center text-center text-2xl border-2 p-4 py-16 cursor-pointer hover:scale-105 transition-transform',
        { 'border-green-500': displaySuccess, 'border-red-500': displayFailure },
        { 'w-auto h-auto': isMobile }
      )}
    >
      <div className="relative">
        {`"${quote}"`}
        <div
          className={classNames(
            'absolute -bottom-10 text-center w-full transition-opacity pointer-events-none',
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
