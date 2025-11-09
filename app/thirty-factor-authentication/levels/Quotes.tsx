import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import Image from 'next/image'

const palette = ['#F08787', '#FFC7A7', '#FEE2AD', '#F8FAB4']

export const QuotesContent = ({ playerId, validateAdvance, cancelAdvance }: ContentProps) => {
  const [selectedQuotes, setSelectedQuotes] = useState<{ id: string; isValid: boolean }[]>([])

  const handleSelect = (id: string, isValid: boolean) => {
    if (selectedQuotes.find((quote) => id === quote.id)) {
      setSelectedQuotes((prev) => {
        const arrayCopy = [...prev]
        return arrayCopy.filter((quote) => quote.id !== id)
      })
    } else {
      setSelectedQuotes((prev) => [...prev, { id, isValid }])
    }
  }

  useEffect(() => {
    if (
      selectedQuotes.length === PlayerInformation[playerId].totalValidQuotes &&
      selectedQuotes.every((quote) => !!quote.isValid)
    ) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [selectedQuotes, cancelAdvance, validateAdvance, playerId])

  const quotes = useMemo(() => {
    const quotes = PlayerInformation[playerId].quotes
    return quotes.sort((a, b) => a.quote.length - b.quote.length)
  }, [playerId])

  return (
    <>
      <h3>Which of these quotes have you said?</h3>
      <div className="flex flex-wrap gap-4 w-[1100px] mt-8">
        {quotes.map((quote, idx) => {
          const key = idx.toString()
          const isSelected = !!selectedQuotes.find((quote) => quote.id === key)
          return (
            <div
              key={key}
              className={classNames(
                'flex gap-3 select-none outline p-2 rounded-2xl shadow-md w-max cursor-pointer transition-transform origin-left',
                { 'outline-3 outline-yellow-300 scale-90': isSelected }
              )}
              style={{ backgroundColor: palette[idx % palette.length] }}
              onClick={() => handleSelect(key, quote.isValid)}
            >
              <Image
                src="/thirty-factor-authentication/check-circle.svg"
                width={24}
                height={24}
                alt="checkmark"
                className={classNames('absolute -top-2 -left-2', { 'opacity-0': !isSelected })}
              />
              <label className="cursor-pointer py-1 text-sm">{`"${quote.quote}"`}</label>
            </div>
          )
        })}
      </div>
    </>
  )
}

export const QuotesControl = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
