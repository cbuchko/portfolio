import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import Image from 'next/image'
import classNames from 'classnames'

export const IdentityLockContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
}: ContentProps) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const player = PlayerInformation[playerId]

  const handleAcknowledge = (checked: boolean) => {
    setIsAcknowledged(checked)
    if (checked) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

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
      <p className="mt-4 text-lg max-w-lg">
        For security, we must complete full verification of this identity.
      </p>
      <div className="mt-5 max-w-md w-full text-left border border-amber-300 bg-amber-50 rounded-md px-3 py-2">
        <p className="text-sm font-semibold text-amber-900">Warning</p>
        <p className="text-sm text-amber-950/80 mt-0.5">
          Three failed verification attempts on a single step will lock this account and reset the
          authentication attempt. Strikes reset when you clear a step.
        </p>
      </div>
      <label
        className={classNames(
          'mt-6 flex items-start gap-3 text-left cursor-pointer select-none max-w-md w-full'
        )}
      >
        <input
          type="checkbox"
          checked={isAcknowledged}
          onChange={(e) => handleAcknowledge(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
        />
        <span className="text-base">
          I am authenticating as this account holder
        </span>
      </label>
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
