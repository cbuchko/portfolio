import { useMemo, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { fallbackPassKey } from '../constants'
import { TextInput } from '../components/TextInput'

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
      <p className="text-lg">Please confirm your new password.</p>
      <TextInput
        value={passInput}
        placeholder="Enter password..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />{' '}
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
