import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import { TextInput } from '../components/TextInput'
import Image from 'next/image'

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
    if (inputTarget.find((alias) => alias.toLocaleLowerCase() === input.toLocaleLowerCase())) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="text-lg">Please confirm your full legal name.</p>
      <div className="flex items-center gap-3 mt-3">
        <Image
          src={`/thirty-factor-authentication/portraits/${player.license.headshot}`}
          alt={player.name}
          width={48}
          height={48}
          className="rounded-full object-cover shrink-0 h-12 w-12 border border-gray-300"
        />
        <div className="min-w-0 grow">
          <TextInput
            value={nameInput}
            placeholder="Enter your name..."
            onChange={handleInputChange}
            onSubmit={handleLevelAdvance}
          />
        </div>
      </div>
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
