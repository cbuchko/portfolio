import { useMemo, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { fallbackPassKey } from '../constants'

export const FallbackTwoContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [passInput, setPassInput] = useState('')

  const passwordCheck = useMemo(() => {
    return sessionStorage.getItem(fallbackPassKey)
  }, [])

  const handleInputChange = (input: string) => {
    setPassInput(input)
    if (input === passwordCheck) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <h3>Please confirm your new password.</h3>
      <input
        className="border w-full rounded-md mt-2 px-2 py-1"
        placeholder="Enter password..."
        value={passInput}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
    </>
  )
}

export const FallbackTwoControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
