import {
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerIds, PlayerInformation } from '../player-constants'
import Image from 'next/image'
import classNames from 'classnames'
import { clampPositionsToScreen } from '../utils'
import { useElementDrag } from '../useElementDrag'

export const PapersPleaseContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  return (
    <>
      <h3 className="mb-4">
        Our authenticators are at their limit. Please manually authenticate this user for us.
      </h3>

      <h3>Identify all discrepancies.</h3>
      <h3>If there are none, approve.</h3>
      <h3>If there are any, deny.</h3>
      <h3 className="mt-4">Selected discrepancies:</h3>
      {typeof window !== 'undefined' && <DriversLicense playerId={playerId} />}
      {typeof window !== 'undefined' && <EntryPermit />}
    </>
  )
}

const width = 400
const height = 100
const DriversLicense = ({ playerId }: { playerId: PlayerIds }) => {
  const playerInfo = PlayerInformation[playerId]
  const licenseRef = useRef<HTMLDivElement>(null)

  const { position, handleDrag } = useElementDrag(licenseRef, {
    x: window.innerWidth / 2 - width / 2,
    y: window.innerHeight / 2 - height / 2,
  })

  if (!position) return null
  return (
    <div
      ref={licenseRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      className="border w-[400px] p-3 rounded-sm license-background depth-container select-none cursor-grab z-10"
      onMouseDown={handleDrag}
    >
      <div className="tracking-widest text-center mb-4 flex justify-between gap-2">
        <InspectableItem>
          <h5 className="text-2xl license-title">PENNSYLVANIA</h5>
        </InspectableItem>
        <h5 className="text-xs font-bold">DRIVER'S LICENCE</h5>
      </div>
      <div className="flex rounded-md bg w-max relative">
        <div className="flex bg-white/40 p-1 rounded-md bg w-max">
          <div className="">
            <InspectableItem>
              <Image
                src={`/thirty-factor-authentication/portraits/${playerInfo.portrait}`}
                alt="headshot"
                className="rounded-md h-[120px]"
                height={120}
                width={110}
              />
            </InspectableItem>
            <InspectableItem>
              <Image
                src="/thirty-factor-authentication/signatures/biden.png"
                alt="signature"
                className="h-[30px]"
                height={30}
                width={110}
              />
            </InspectableItem>
          </div>
          <div className="ml-2 flex flex-col">
            <InspectableItem>
              <h5 className="text-xs mb-1 font-medium">{playerInfo.fullName}</h5>
            </InspectableItem>
            <IDDetail label="No" value={'12345678'} />
            <IDDetail label="Issued" value={playerInfo.license.issued} />
            <IDDetail label="Expires" value={playerInfo.license.expires} />
            <IDDetail label="DOB" value={playerInfo.license.dob} />
            <div className="grid grid-cols-2">
              <IDDetail label="Ht" value={playerInfo.license.height} />
              <IDDetail label="Wt" value={playerInfo.license.weight} />
              <IDDetail label="Eyes" value={playerInfo.license.eyes} />
              <IDDetail label="Hair" value={playerInfo.license.hair} />
              <IDDetail label="Children" value={playerInfo.license.children} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-evenly w-[100px]">
          <InspectableItem>
            <Image
              src={`/thirty-factor-authentication/state-arms/penn.svg`}
              alt="coat-of-arms"
              className="h-[50px]"
              height={50}
              width={80}
            />
          </InspectableItem>
          <InspectableItem>
            <Image
              src={`/thirty-factor-authentication/portraits/${playerInfo.portrait}`}
              alt="headshot-small"
              className="rounded-lg"
              height={25}
              width={25}
            />
          </InspectableItem>
        </div>
      </div>
    </div>
  )
}

const InspectableItem = ({ children }: PropsWithChildren) => {
  const [isHovering, setIsHovering] = useState(false)
  return (
    <div
      className={classNames('outline-offset-2 rounded-md cursor-pointer', {
        'outline-2': isHovering,
      })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
    </div>
  )
}

const IDDetail = ({ label, value }: { label: string; value: string }) => {
  return (
    <InspectableItem>
      <div className="text-sm flex justify-between gap-1 mb-0.5 mr-3">
        <small className="text-blue-500 font-semibold">{`${label}: `}</small>
        <small className="font-medium">{value}</small>
      </div>
    </InspectableItem>
  )
}

const EntryPermit = () => {
  const permitRef = useRef<HTMLDivElement>(null)

  const { position, handleDrag } = useElementDrag(permitRef, {
    x: window.innerWidth / 2 - 350 / 2,
    y: window.innerHeight / 2 - 200 / 2,
  })

  if (!position) return null
  return (
    <div
      ref={permitRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      className="outline-2 -outline-offset-16 outline-amber-800   w-[350px] h-[470px] shadow-xl py-2 px-8 bg-yellow-50 cursor-grab select-none flex flex-col items-center"
      onMouseDown={handleDrag}
    >
      <h2 className="absolute top-0 text-2xl text-center !bg-yellow-50">THIRTY FACTOR</h2>
      <h2 className="text-2xl text-center mt-6">Entry Permit</h2>
      <p className="mt-4">
        Conditional entry into Thirty Factor Authentication is hereby granted to
      </p>
      <InspectableItem>
        <p className="mt-4 text-[#284283]">Joseph Biden</p>
      </InspectableItem>
      <div className="border-b w-full" />
      <p className="mt-4 w-full">bearing licence number</p>
      <InspectableItem>
        <p className="mt-4 text-[#284283]">12345678</p>
      </InspectableItem>
      <div className="border-b w-full" />
      <div className="w-full mt-4">
        <PermitDetail label="Date of Birth" value="12-23-22" />
        <PermitDetail label="Issuing Body" value="Pennsylvania" />
        <PermitDetail label="Enter by" value="2025-11-11" />
      </div>
      <InspectableItem>
        <Image
          src={`/thirty-factor-authentication/state-arms/penn.svg`}
          alt="coat-of-arms"
          className="h-[50px] mt-2"
          height={50}
          width={80}
        />
      </InspectableItem>
    </div>
  )
}

const PermitDetail = ({ label, value }: { label: string; value: string }) => {
  return (
    <InspectableItem>
      <div className="flex w-full mt-4 items-center">
        <label className="w-[60%] text-sm">{label}</label>
        <div className="w-full">
          <p className="text-center text-[#284283]">{value}</p>
          <div className="border-b" />
        </div>
      </div>
    </InspectableItem>
  )
}

export const PapersPleaseControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <button
        className="auth-button auth-button-primary !bg-red-400 font-semibold tracking-widest"
        onClick={() => handleLevelAdvance()}
      >
        DENIED
      </button>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary !bg-green-400 font-semibold tracking-widest"
        onClick={() => handleLevelAdvance()}
      >
        APPROVED
      </button>
    </>
  )
}
