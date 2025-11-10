import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import Image from 'next/image'

export const PapersPleaseContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const playerInfo = PlayerInformation[playerId]
  const containerRef = useRef<HTMLDivElement>(null)

  //sets up mouse tracking for meme rotation on hover
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mousemove', (e) => {
      const translateZ = 100 // pop out a bit

      container.style.transform = `translateZ(${translateZ}px)`
    })

    container.addEventListener('mouseleave', () => {
      container.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)'
    })
  }, [])

  return (
    <>
      <h3>Identify the discrepancies in your ID.</h3>
      <div
        ref={containerRef}
        className="border w-[360px] p-3 mt-8 rounded-sm license-background depth-container"
      >
        <div className="tracking-widest text-center mb-4 flex justify-between gap-2">
          <h5 className="text-2xl license-title">PENNSYLVANIA</h5>
          <h5 className="text-xs font-bold">DRIVER'S LICENCE</h5>
        </div>
        <div className="flex bg-white/40 p-1 rounded-md bg w-max relative">
          <div className="relative">
            <Image
              src={`/thirty-factor-authentication/portraits/${playerInfo.portrait}`}
              alt="headshot"
              className="rounded-md h-[100px]"
              height={100}
              width={90}
            />
            <Image
              src="/thirty-factor-authentication/signatures/biden.png"
              alt="headshot"
              className="rounded-md h-[30px] absolute -bottom-3"
              height={20}
              width={80}
            />
          </div>
          <div className="ml-2 flex flex-col">
            <IDDetail label="Issued" value={playerInfo.license.issued} />
            <IDDetail label="Expires" value={playerInfo.license.expires} />
            <IDDetail label="DOB" value={playerInfo.license.dob} />
            <div className="grid grid-cols-2">
              <IDDetail label="Ht" value={playerInfo.license.height} />
              <IDDetail label="Wt" value={playerInfo.license.weight} />
              <IDDetail label="Eyes" value={playerInfo.license.eyes} />
              <IDDetail label="Hair" value={playerInfo.license.hair} />
              <IDDetail label="Eyes" value={playerInfo.license.eyes} />
              <IDDetail label="Children" value={playerInfo.license.children} />
            </div>
          </div>
          <Image
            src={`/thirty-factor-authentication/portraits/${playerInfo.portrait}`}
            alt="headshot"
            className="absolute rounded-md h-[25px] self-end ml-8 mb-2 -right-14"
            height={25}
            width={25}
          />
        </div>
      </div>
    </>
  )
}

const IDDetail = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="text-sm flex justify-between gap-1 mb-0.5 mr-3">
      <small className="text-blue-500 font-semibold">{`${label}: `}</small>
      <small className="font-medium">{value}</small>
    </div>
  )
}

export const PapersPleaseControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
