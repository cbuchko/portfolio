import { useState } from 'react'
import classNames from 'classnames'
import { ContentProps, ControlProps } from './types'
import { fallbackPassKey } from '../constants'
import { TextInput } from '../components/TextInput'

const monthRe =
  /(January|February|March|April|May|June|July|August|September|October|November|December)/i
const consecutiveConsonantsRe = /[B-DF-HJ-NP-TV-X]{2}/i

type PasswordRules = {
  length: boolean
  uppercase: boolean
  symbols: boolean
  consonants: boolean
  month: boolean
}

const RULES: { key: keyof PasswordRules; label: string }[] = [
  { key: 'length', label: 'At least 10 total characters' },
  { key: 'uppercase', label: 'Exactly four uppercase characters' },
  { key: 'symbols', label: 'Exactly two symbols' },
  { key: 'consonants', label: 'No consecutive consonants' },
  { key: 'month', label: 'A month of the year' },
]

const evaluatePassword = (input: string): PasswordRules => ({
  length: input.length >= 10,
  uppercase: (input.match(/[A-Z]/g) || []).length === 4,
  symbols: (input.match(/[^A-Za-z0-9]/g) || []).length === 2,
  month: monthRe.test(input),
  consonants: !consecutiveConsonantsRe.test(input),
})

const isPasswordValid = (rules: PasswordRules) =>
  rules.length && rules.uppercase && rules.symbols && rules.month && rules.consonants

const passwordSubmit: { attempt: (() => void) | null } = { attempt: null }

export const FallbackOneContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [passInput, setPassInput] = useState('')
  const [failedAtSubmit, setFailedAtSubmit] = useState<PasswordRules | null>(null)

  const syncValidity = (input: string) => {
    const next = evaluatePassword(input)
    if (isPasswordValid(next)) {
      sessionStorage.setItem(fallbackPassKey, input)
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  const handleInputChange = (input: string) => {
    setPassInput(input)
    syncValidity(input)
  }

  const attemptAdvance = () => {
    const next = evaluatePassword(passInput)
    if (!isPasswordValid(next)) setFailedAtSubmit(next)
    handleLevelAdvance()
  }
  passwordSubmit.attempt = attemptAdvance

  return (
    <>
      <p className="text-lg">{`We've changed our password policies since your last login.`}</p>
      <p className="text-lg">Please create a new password.</p>
      <TextInput
        value={passInput}
        placeholder="Enter password..."
        onChange={handleInputChange}
        onSubmit={attemptAdvance}
      />
      <div className="text-sm mt-4">
        <div>The password must include:</div>
        <ul className="list-disc ml-4">
          {RULES.map((rule) => (
            <li
              key={rule.key}
              className={classNames({ 'text-red-600': failedAtSubmit && !failedAtSubmit[rule.key] })}
            >
              {rule.label}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export const FallbackOneControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary"
        onClick={() => {
          if (passwordSubmit.attempt) passwordSubmit.attempt()
          else handleLevelAdvance()
        }}
      >
        Submit
      </button>
    </>
  )
}
