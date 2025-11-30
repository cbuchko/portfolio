import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { fallbackPassKey } from '../constants'
import { TextInput } from '../components/TextInput'

const monthRe =
  /(January|February|March|April|May|June|July|August|September|October|November|December)/i
const consecutiveConsonantsRe = /[B-DF-HJ-NP-TV-X]{2}/i

export const FallbackOneContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [passInput, setPassInput] = useState('')

  const handleInputChange = (input: string) => {
    setPassInput(input)
    if (
      input.length >= 10 &&
      (input.match(/[A-Z]/g) || []).length === 4 &&
      (input.match(/[^A-Za-z0-9]/g) || []).length === 2 &&
      monthRe.test(input) &&
      !consecutiveConsonantsRe.test(input)
    ) {
      sessionStorage.setItem(fallbackPassKey, input)
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="text-lg">{`We've changed our password policies since your last login.`}</p>
      <p className="text-lg">Please create a new password.</p>
      <TextInput
        value={passInput}
        placeholder="Enter password..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />
      <div className="text-sm mt-4">
        <div>The password must include:</div>
        <ul className="list-disc ml-4">
          <li>At least 10 total characters</li>
          <li>Four uppercase characters total</li>
          <li>Two symbols total</li>
          <li>No consecutive consonants</li>
          <li>A month of the year</li>
        </ul>
      </div>
    </>
  )
}

export const FallbackOneControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
