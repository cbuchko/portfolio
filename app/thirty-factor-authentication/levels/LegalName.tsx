import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import { TextInput } from '../components/TextInput'
import Image from 'next/image'
import classNames from 'classnames'

const NAME_SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'junior', 'senior'])

/** Same-width redaction per word so letter counts never leak. Suffixes get a shorter block. */
const redactNameTokens = (fullName: string) =>
  fullName
    .replace(/,/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (NAME_SUFFIXES.has(word.toLocaleLowerCase()) ? 'suffix' : 'word'))

/** iOS/Android smart punctuation uses ’ (U+2019), not the ASCII ' in O'Brien. */
const foldLegalName = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201B\u2032\u00B4`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase()

export const LegalNameContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [nameInput, setNameInput] = useState('')
  const player = PlayerInformation[playerId]
  const inputTarget = player.fullNameAliases

  const handleInputChange = (input: string) => {
    setNameInput(input)
    const typed = foldLegalName(input)
    if (inputTarget.find((alias) => foldLegalName(alias) === typed)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="text-lg">We have lost your name in our recoreds. Please re-confirm your full legal name.</p>
      <div className="mt-3 flex items-center gap-3 border border-gray-300 bg-gray-50 px-3 py-2 mb-2">
        <Image
          src={`/thirty-factor-authentication/portraits/${player.license.headshot}`}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full border border-gray-300 object-cover"
        />
        <div className="min-w-0 grow">
          <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500 uppercase">
            Name on file
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5" aria-hidden>
            {redactNameTokens(player.fullName).map((kind, idx) => (
              <span
                key={idx}
                className={classNames('inline-block h-2.5 rounded-[1px] bg-gray-800', {
                  'w-11': kind === 'word',
                  'w-5': kind === 'suffix',
                })}
              />
            ))}
          </div>
        </div>
      </div>
      <TextInput
        value={nameInput}
        placeholder="Enter your full legal name..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />
    </>
  )
}

export const LegalNameControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
