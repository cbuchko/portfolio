import { useEffect, useMemo, useState } from 'react'
import { PlayerIds, PlayerInformation } from '../player-constants'
import { ContentProps, ControlProps } from './types'
import { DropdownSelector } from '../components/dropdown-selector'

export const OneContent = ({ playerId, setPlayerId, validateAdvance }: ContentProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    validateAdvance()
  }, [validateAdvance])

  const [options, nameKeys] = useMemo(() => {
    const options = Object.entries(PlayerInformation).map(([id, info]) => {
      return { id: id as unknown as PlayerIds, name: info.name }
    })
    const nameKeys: Record<string, PlayerIds> = {}
    options.forEach((option) => {
      nameKeys[option.name] = option.id
    })
    return [options.map((option) => option.name), nameKeys]
  }, [])

  const handleCharacterSelect = (option: string) => {
    const id = nameKeys[option]
    setPlayerId(id)
    localStorage.setItem('playerId', id.toString())
  }

  return (
    <>
      <h2 className="mb-4 text-3xl">Welcome Back!</h2>
      <p className="text-lg">{`It's been a while since we've seen you.`}</p>
      <p className="text-lg">{` Please confirm your identity to continue.`}</p>
      <div className="mt-4 flex items-center gap-4">
        {`Previously Signed In As:`}{' '}
        <span className="font-semibold">
          <DropdownSelector
            id="character-select"
            onOptionSelect={handleCharacterSelect}
            options={options}
            setActiveId={() =>
              isDropdownOpen ? setIsDropdownOpen(false) : setIsDropdownOpen(true)
            }
            defaultOption={PlayerInformation[playerId].name}
            activeId={isDropdownOpen ? 'character-select' : undefined}
            width={150}
            includeBlankOption={false}
          />
        </span>
      </div>
    </>
  )
}

export const OneControls = ({ handleLevelAdvance, handleGameOver }: ControlProps) => {
  return (
    <>
      <button className="auth-button" onClick={handleGameOver}>
        {`That's Not Me!`}
      </button>
      <button className="auth-button" onClick={() => handleLevelAdvance()}>
        {`That's Me!`}
      </button>
    </>
  )
}
