import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'

export const TwoContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [nameInput, setNameInput] = useState('')
  const inputTarget = PlayerInformation[playerId].fullNameAliases

  const handleInputChange = (input: string) => {
    setNameInput(input)
    if (inputTarget.find((alias) => alias.toLocaleLowerCase() === input.toLocaleLowerCase())) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="text-lg">Please confirm your full legal name</p>
      <input
        className="border w-full rounded-md mt-1 px-2 py-1"
        placeholder="Enter your name..."
        value={nameInput}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
    </>
  )
}

export const TwoControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
