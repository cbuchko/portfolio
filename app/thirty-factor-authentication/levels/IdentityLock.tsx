import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import Image from 'next/image'
import classNames from 'classnames'

const ACKNOWLEDGMENTS = [
  'I wish to authenticate as this account holder',
  "I acknowledge if I'm not this identity I will certainly quit before finishing",
  'Three mistakes on a single step will reset the session',
  'If I give up I accept that I am weak willed and will likely not achieve anything today',
] as const

export const IdentityLockContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
}: ContentProps) => {
  const [checked, setChecked] = useState<boolean[]>(() =>
    ACKNOWLEDGMENTS.map(() => false)
  )
  const player = PlayerInformation[playerId]

  const handleCheck = (index: number, value: boolean) => {
    const next = [...checked]
    next[index] = value
    if (!value) {
      for (let i = index + 1; i < next.length; i++) next[i] = false
    }
    setChecked(next)

    if (next.every(Boolean)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  // Show the next box only after the previous one is checked
  const visibleCount = checked.findIndex((c) => !c)
  const shownCount = visibleCount === -1 ? ACKNOWLEDGMENTS.length : visibleCount + 1

  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src={`/thirty-factor-authentication/portraits/${player.license.headshot}`}
        alt={player.name}
        width={96}
        height={96}
        className="rounded-full object-cover h-24 w-24 border border-gray-300"
      />
      <p className="mt-4 text-sm text-gray-500">Signing in as</p>
      <h2 className="text-2xl font-semibold">{player.name}</h2>
      <p className="text-sm text-gray-500">{player.email}</p>
      <p className="mt-6 text-lg max-w-lg">
        This account uses <span className="font-bold">THIRTY FACTOR AUTHENTICATION</span> to
        protect its data. Our state of the art verification via attrition software exploits the human tendency to give up when things get slightly difficult. 
      </p>
      <div className="mt-6 flex flex-col gap-3 w-full max-w-lg">
        {ACKNOWLEDGMENTS.slice(0, shownCount).map((label, index) => (
          <label
            key={label}
            className={classNames(
              'flex items-start gap-3 text-left cursor-pointer select-none',
              { 'identity-lock-ack': index > 0 }
            )}
          >
            <input
              type="checkbox"
              checked={checked[index]}
              onChange={(e) => handleCheck(index, e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
            />
            <span className="text-base">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export const IdentityLockControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Continue
      </button>
    </>
  )
}
