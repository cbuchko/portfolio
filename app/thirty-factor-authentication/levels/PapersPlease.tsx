import { PropsWithChildren, useRef, useState, useMemo } from 'react'
import { ContentProps } from './types'
import { Player, PlayerIds, PlayerInformation } from '../player-constants'
import Image from 'next/image'
import classNames from 'classnames'
import { makeAuthCode, shuffle } from '../utils'
import { useElementDrag } from '../useElementDrag'

type Discrepancy = {
  id: string
  title: string
}

type GameInfo = Player['license'] & {
  issued: string
  expires: string
  licenseNumber: string
  permitNumber: string
  entry: string
}

const DiscrepancyBase: Record<string, Discrepancy> = {
  ['location']: { id: 'location', title: 'ID Issuer' },
  ['headshot']: { id: 'headshot', title: 'Headshot' },
  ['signature']: { id: 'signature', title: 'Signature' },
  ['name']: { id: 'name', title: 'Full Name' },
  ['number']: { id: 'number', title: 'Identification Number' },
  ['issued']: { id: 'issued', title: 'Issuing Date' },
  ['expires']: { id: 'expires', title: 'Expiry Date' },
  ['dob']: { id: 'dob', title: 'Date of Birth' },
  ['height']: { id: 'height', title: 'Height' },
  ['eyes']: { id: 'eyes', title: 'Eye Color' },
  ['hair']: { id: 'hair', title: 'Hair Color' },
  ['children']: { id: 'children', title: 'Number of Children' },
  ['entry']: { id: 'entry', title: 'Authentication Date' },
  ['coat']: { id: 'coat', title: 'Coat of Arms' },
}

export const PapersPleaseContent = ({ playerId, handleLevelAdvance }: ContentProps) => {
  const [isShowingCitation, setIsShowingCitation] = useState(false)
  const { gameInfo: baseGameInfo, discrepancyKeys: baseDiscrepancyKeys } = useMemo(
    () => generateDiscrepancies(playerId),
    [playerId]
  )
  const [gameInfo, setGameInfo] = useState(baseGameInfo)
  const [discrepancyKeys, setDiscrepancyKeys] = useState(baseDiscrepancyKeys)
  const [selectedDiscrepancyIds, setSelectedDiscrepancyIds] = useState<Set<string>>(new Set())

  const handleApprove = () => {
    setIsShowingCitation(true)
    if (discrepancyKeys.size === 0 && selectedDiscrepancyIds.size === 0) {
      handleLevelAdvance(true)
      return
    }
    handleLevelAdvance()
  }

  const handleDecline = () => {
    if (
      discrepancyKeys.size !== 0 &&
      discrepancyKeys.size === selectedDiscrepancyIds.size &&
      Array.from(selectedDiscrepancyIds).every((id) => discrepancyKeys.has(id))
    ) {
      handleLevelAdvance(true)
      return
    }
    setIsShowingCitation(true)
    handleLevelAdvance()
  }

  const handleDiscrepancySelect = (id: string) => {
    if (selectedDiscrepancyIds.has(id)) {
      removeDiscrepancy(id)
      return
    }
    addDiscrepancy(id)
  }

  const addDiscrepancy = (id: string) =>
    setSelectedDiscrepancyIds((set) => {
      const setCopy = new Set(set)
      setCopy.add(id)
      return setCopy
    })
  const removeDiscrepancy = (id: string) =>
    setSelectedDiscrepancyIds((set) => {
      const setCopy = new Set(set)
      setCopy.delete(id)
      return setCopy
    })

  const handleReset = () => {
    const { gameInfo, discrepancyKeys } = generateDiscrepancies(playerId)
    setGameInfo(gameInfo)
    setDiscrepancyKeys(discrepancyKeys)
    setIsShowingCitation(false)
    setSelectedDiscrepancyIds(new Set())
  }

  return (
    <>
      <p className="mb-4 text-lg">
        Our authenticators are at their limit. Please manually authenticate this user for us.
      </p>
      <div className="flex justify-between gap-8">
        <div>
          <p className="text-lg max-w-[400px]">
            Identify all information on each document that is incorrect or otherwise invalid.
          </p>
          <p className="mb-2 text-sm italic">eg. incorrect hair color or expired identification</p>
          <p className="text-lg mt-4">After selecting everything you believe to be an error:</p>
          <ol className="list-disc ml-4 text-lg">
            <li>Click DENIED if you identified any errors</li>
            <li>Click APPROVED if you identified no errors</li>
          </ol>
        </div>
        <div className="border w-[300px] min-h-[200px] text-sm p-2 rounded-sm italic mono">
          <div className="font-bold">Errors Identified:</div>
          <div className="flex flex-wrap gap-4 mt-2">
            {Array.from(selectedDiscrepancyIds).map((discrepancyId) => {
              const discrepancy = DiscrepancyBase[discrepancyId]
              return (
                <div key={discrepancyId} className="flex gap-2 group">
                  <div className="underline">{discrepancy.title}</div>
                  <Image
                    src="/thirty-factor-authentication/icons/close.svg"
                    alt="x"
                    className="group-hover:opacity-100 opacity-0 cursor-pointer"
                    width={16}
                    height={16}
                    onClick={() => removeDiscrepancy(discrepancyId)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {typeof window !== 'undefined' && (
        <DriversLicense
          playerId={playerId}
          gameInfo={gameInfo}
          addDiscrepancy={handleDiscrepancySelect}
        />
      )}
      {typeof window !== 'undefined' && (
        <EntryPermit gameInfo={gameInfo} addDiscrepancy={handleDiscrepancySelect} />
      )}
      {isShowingCitation && <Citation discrepancyKeys={discrepancyKeys} onReset={handleReset} />}
      <div className="flex justify-end mt-4 gap-8">
        <button
          className="button-stamp bg-red-400 font-extrabold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          onClick={handleDecline}
          disabled={selectedDiscrepancyIds.size === 0}
        >
          DENIED
        </button>
        <button
          className="button-stamp bg-green-400 font-extrabold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          onClick={handleApprove}
          disabled={selectedDiscrepancyIds.size > 0}
        >
          APPROVED
        </button>
      </div>
    </>
  )
}

const width = 400
const height = 100

const DriversLicense = ({
  playerId,
  gameInfo,
  addDiscrepancy,
}: {
  playerId: PlayerIds
  gameInfo: GameInfo
  addDiscrepancy: (id: string) => void
}) => {
  const licenseRef = useRef<HTMLDivElement>(null)

  const { position, handleDrag, isDragging } = useElementDrag(licenseRef, {
    x: window.innerWidth / 2 - width / 2,
    y: window.innerHeight / 2 - height / 2,
  })

  const handleDiscrepancySelect = (id: string) => {
    if (isDragging) return
    addDiscrepancy(id)
  }

  if (!position) return null
  return (
    <div
      ref={licenseRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      className="border w-[400px] p-3 rounded-sm license-background depth-container select-none cursor-grab z-100"
      onMouseDown={handleDrag}
    >
      <div className="tracking-widest text-center mb-4 flex justify-between gap-2">
        <h5 className="text-2xl license-title uppercase">
          {PlayerInformation[playerId].license.location}
        </h5>
        <h5 className="text-xs font-bold">{'THIRTY FACTOR ID'}</h5>
      </div>
      <div className="flex rounded-md bg w-max relative">
        <div className="flex bg-white/40 p-1 rounded-md bg w-max min-w-[290px]">
          <div className="">
            <InspectableItem
              discrepancyId={DiscrepancyBase['headshot'].id}
              addDiscrepancy={handleDiscrepancySelect}
            >
              <Image
                src={`/thirty-factor-authentication/portraits/${PlayerInformation[playerId].license.headshot}`}
                alt="headshot"
                className="rounded-md h-[120px]"
                height={120}
                width={110}
                draggable={false}
              />
            </InspectableItem>
            <InspectableItem
              discrepancyId={DiscrepancyBase['signature'].id}
              addDiscrepancy={handleDiscrepancySelect}
            >
              <Image
                src={`/thirty-factor-authentication/signatures/${gameInfo.signature}`}
                alt="signature"
                className="h-[30px]"
                height={30}
                width={110}
                draggable={false}
              />
            </InspectableItem>
          </div>
          <div className="ml-2 flex flex-col">
            <InspectableItem
              discrepancyId={DiscrepancyBase['name'].id}
              addDiscrepancy={handleDiscrepancySelect}
            >
              <h5 className="text-xs mb-1 font-medium">{gameInfo.name}</h5>
            </InspectableItem>
            <IDDetail
              label="No"
              value={gameInfo.licenseNumber}
              discrepancyId={DiscrepancyBase['number'].id}
              addDiscrepancy={handleDiscrepancySelect}
            />
            <IDDetail
              label="Issued"
              value={gameInfo.issued}
              discrepancyId={DiscrepancyBase['issued'].id}
              addDiscrepancy={handleDiscrepancySelect}
              isSelectable={false}
            />
            <IDDetail
              label="Expires"
              value={gameInfo.expires}
              discrepancyId={DiscrepancyBase['expires'].id}
              addDiscrepancy={handleDiscrepancySelect}
            />
            <IDDetail
              label="DOB"
              value={gameInfo.dob}
              discrepancyId={DiscrepancyBase['dob'].id}
              addDiscrepancy={handleDiscrepancySelect}
            />
            <div className="grid grid-cols-2">
              <IDDetail
                label="Ht"
                value={gameInfo.height}
                discrepancyId={DiscrepancyBase['height'].id}
                addDiscrepancy={handleDiscrepancySelect}
              />
              <IDDetail
                label="Eyes"
                value={gameInfo.eyes}
                discrepancyId={DiscrepancyBase['eyes'].id}
                addDiscrepancy={handleDiscrepancySelect}
              />
              <IDDetail
                label="Hair"
                value={gameInfo.hair}
                discrepancyId={DiscrepancyBase['hair'].id}
                addDiscrepancy={handleDiscrepancySelect}
              />
              <IDDetail
                label="Children"
                value={gameInfo.children}
                discrepancyId={DiscrepancyBase['children'].id}
                addDiscrepancy={handleDiscrepancySelect}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-evenly w-[100px]">
          <InspectableItem
            discrepancyId={DiscrepancyBase['coat'].id}
            addDiscrepancy={handleDiscrepancySelect}
          >
            <Image
              src={`/thirty-factor-authentication/state-arms/${gameInfo.coat}`}
              alt="coat-of-arms"
              className="h-[50px]"
              height={50}
              width={80}
              draggable={false}
            />
          </InspectableItem>
          <InspectableItem
            discrepancyId={DiscrepancyBase['headshot'].id}
            addDiscrepancy={handleDiscrepancySelect}
          >
            <Image
              src={`/thirty-factor-authentication/portraits/${gameInfo.headshot}`}
              alt="headshot-small"
              className="rounded-lg"
              height={25}
              width={25}
              draggable={false}
            />
          </InspectableItem>
        </div>
      </div>
    </div>
  )
}

const InspectableItem = ({
  discrepancyId,
  addDiscrepancy,
  isSelectable = true,
  children,
}: {
  discrepancyId: Discrepancy['id']
  addDiscrepancy: (id: string) => void
  isSelectable?: boolean
} & PropsWithChildren) => {
  const [isHovering, setIsHovering] = useState(false)

  if (!isSelectable) return children
  return (
    <div
      className={classNames('outline-offset-2 rounded-md cursor-pointer', {
        'outline-2': isHovering,
      })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => addDiscrepancy(discrepancyId)}
    >
      {children}
    </div>
  )
}

const IDDetail = ({
  label,
  value,
  discrepancyId,
  addDiscrepancy,
  isSelectable = true,
}: {
  label: string
  value: string
  discrepancyId: Discrepancy['id']
  addDiscrepancy: (id: string) => void
  isSelectable?: boolean
}) => {
  return (
    <InspectableItem
      discrepancyId={discrepancyId}
      addDiscrepancy={addDiscrepancy}
      isSelectable={isSelectable}
    >
      <div className="text-sm flex justify-between gap-1 mb-0.5 mr-3">
        <small className="text-blue-500 font-semibold">{`${label}: `}</small>
        <small className="font-medium">{value}</small>
      </div>
    </InspectableItem>
  )
}

const EntryPermit = ({
  gameInfo,
  addDiscrepancy,
}: {
  gameInfo: GameInfo
  addDiscrepancy: (id: string) => void
}) => {
  const permitRef = useRef<HTMLDivElement>(null)

  const { position, handleDrag, isDragging } = useElementDrag(permitRef, {
    x: window.innerWidth / 2 - 350 / 2,
    y: window.innerHeight / 2 - 200 / 2,
  })

  const handleDiscrepancySelect = (id: string) => {
    if (isDragging) return
    addDiscrepancy(id)
  }

  if (!position) return null
  return (
    <div
      ref={permitRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      className="outline-2 -outline-offset-16 outline-amber-800 w-[350px] h-[470px] shadow-xl py-2 px-8 bg-yellow-50 cursor-grab select-none flex flex-col items-center z-50"
      onMouseDown={handleDrag}
    >
      <h2 className="absolute top-0 text-2xl text-center !bg-yellow-50">THIRTY FACTOR</h2>
      <h2 className="text-2xl text-center mt-6">Authentication Permit</h2>
      <p className="mt-4">
        Conditional entry into Thirty Factor Authentication is hereby granted to
      </p>
      <InspectableItem
        discrepancyId={DiscrepancyBase['name'].id}
        addDiscrepancy={handleDiscrepancySelect}
      >
        <p className="mt-4 text-[#284283]">{gameInfo.name}</p>
      </InspectableItem>
      <div className="border-b w-full" />
      <p className="mt-4 w-full">bearing identification number</p>
      <InspectableItem
        discrepancyId={DiscrepancyBase['number'].id}
        addDiscrepancy={handleDiscrepancySelect}
      >
        <p className="mt-4 text-[#284283]">{gameInfo.permitNumber}</p>
      </InspectableItem>
      <div className="border-b w-full" />
      <div className="w-full mt-4">
        <PermitDetail
          label="Date of Birth"
          value={gameInfo.dob}
          discrepancyId={DiscrepancyBase['dob'].id}
          addDiscrepancy={handleDiscrepancySelect}
        />
        <PermitDetail
          label="ID Issued by"
          value={gameInfo.location}
          discrepancyId={DiscrepancyBase['location'].id}
          addDiscrepancy={handleDiscrepancySelect}
        />
        <PermitDetail
          label="Authenticate by"
          value={gameInfo.entry}
          discrepancyId={DiscrepancyBase['entry'].id}
          addDiscrepancy={handleDiscrepancySelect}
        />
      </div>
      <InspectableItem
        discrepancyId={DiscrepancyBase['coat'].id}
        addDiscrepancy={handleDiscrepancySelect}
      >
        <Image
          src={`/thirty-factor-authentication/state-arms/${gameInfo.coat}`}
          alt="coat-of-arms"
          className="h-[50px] mt-2"
          height={50}
          width={80}
          draggable={false}
        />
      </InspectableItem>
    </div>
  )
}

const PermitDetail = ({
  label,
  value,
  discrepancyId,
  addDiscrepancy,
}: {
  label: string
  value: string
  discrepancyId: Discrepancy['id']
  addDiscrepancy: (id: string) => void
}) => {
  return (
    <InspectableItem discrepancyId={discrepancyId} addDiscrepancy={addDiscrepancy}>
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

const Citation = ({
  discrepancyKeys,
  onReset,
}: {
  discrepancyKeys: Set<string>
  onReset: () => void
}) => {
  return (
    <>
      <div className="fixed w-[600px]  bg-pink-100 z-200 top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] mono px-8 py-3 border-1 border-dotted">
        <div className="text-xl mb-4">CITATION</div>
        <div className="border-b-3 border-dotted" />
        <div className="text-md mt-4">{`You didn't identify all errors.`}</div>
        <div className="text-md mt-1">Errors Expected:</div>
        {Array.from(discrepancyKeys).map((key, idx) => {
          return (
            <span key={idx}>
              {DiscrepancyBase[key].title}
              {idx !== discrepancyKeys.size - 1 ? ', ' : ''}
            </span>
          )
        })}
        <div className="border-b-3 border-dotted mt-4" />
        <button className="auth-button mt-4" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="fixed w-screen h-screen bg-black/20 top-0 left-0" />
    </>
  )
}

const generateDiscrepancies = (
  playerId: PlayerIds
): { gameInfo: GameInfo; discrepancyKeys: Set<string> } => {
  const discrepancyIds: Set<string> = new Set()

  let info = PlayerInformation[playerId].license

  //between 2-4 (N) discrepencies
  const numberOfDiscrepencies = Math.ceil(Math.random() * (4 - 2) + 2)
  const discrepancyKeys = shuffle(Object.keys(DiscrepancyBase))

  //the first N indexes get turned into Errors
  for (let i = 0; i < numberOfDiscrepencies; i++) {
    const key = discrepancyKeys[i]
    if (key !== 'issued') discrepancyIds.add(key)
    const falseInfo = Object.entries(PlayerInformation[playerId].fakeLicense).find(
      ([fk]) => fk === key
    )
    if (!falseInfo) continue
    info = { ...info, [key]: falseInfo[1] }
  }
  return {
    gameInfo: { ...info, ...getDynamicInfo(discrepancyIds) },
    discrepancyKeys: discrepancyIds,
  }
}

//generate the info that changes everytime
const getDynamicInfo = (discrepancyIds?: Set<string>) => {
  const licenseNumber = makeAuthCode(9)
  let permitNumber = makeAuthCode(9)

  if (!discrepancyIds?.has('number')) {
    permitNumber = licenseNumber
  }

  let entry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  if (discrepancyIds?.has('entry')) {
    entry = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }

  const futureDate = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000)
  futureDate.setFullYear(futureDate.getFullYear() + 2)
  let expires = futureDate.toISOString().split('T')[0]
  if (discrepancyIds?.has('expires')) {
    const pastDate = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000)
    pastDate.setFullYear(pastDate.getFullYear() - 2)
    expires = pastDate.toISOString().split('T')[0]
  }

  const issuedDate = new Date(expires)
  issuedDate.setFullYear(issuedDate.getFullYear() - 5)
  const issued = issuedDate.toISOString().split('T')[0]
  return { licenseNumber, permitNumber, entry, expires, issued }
}
