import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeCode } from '../utils'
import classNames from 'classnames'
import { useMessageSpam } from '../useMessageSpam'

const messages = [
  'hey what you up to?',
  'Mom and I would like to FaceTime.',
  'Message: Exclusive loyalty offer.',
  'can we talk about last night please???',
  'Jeff emphasized "lads we should get kbbq"',
  '😂😂😂',
  'Your phone bill is ready to be reviewed.',
]

type WireType = {
  color: string
  isCut?: boolean
}

const Wires: Record<string, WireType> = {
  red: { color: 'bg-red-500' },
  yellow: { color: 'bg-yellow-300' },
  white: { color: 'bg-white' },
  blue: { color: 'bg-blue-500' },
  purple: { color: 'bg-purple-500' },
}

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const maxTimeInSeconds = 60
export const BombDefusalContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [wires, setWires] = useState(Wires)
  const [code, setCode] = useState('')
  const codeRef = useRef(makeCode(12))

  const [timer, setTimer] = useState(maxTimeInSeconds)

  const { message, handleResendCode } = useMessageSpam(
    messages,
    `Your authentication code is: ${codeRef.current}\n hello`
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((time) => time - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timer <= 0) {
      handleLevelAdvance()
      setTimer(maxTimeInSeconds)
      setWires(Wires)
      setCode('')
    }
  }, [timer])

  const cutWire = (id: string) => {
    setWires((prevWires) => ({ ...prevWires, [id]: { ...prevWires[id], isCut: true } }))
  }

  const inputCode = (number: number) => {
    if (code.length >= 4) return
    setCode((prevCode) => prevCode + number.toString())
  }

  const codeDisplay = code.padStart(4, '0')
  return (
    <>
      <h3>{`We've sent instructions to defuse this bomb to your mobile device.`}</h3>
      <div className="flex justify-between mt-2">
        <small>{`Don't tell the instructions to anyone.`}</small>
        <button className="text-xs underline cursor-pointer" onClick={handleResendCode}>
          Resend Instructions
        </button>
      </div>
      <div className="flex justify-center w-full mt-4">
        <div className="flex justify-between border rounded-md bg-gray-500 w-[500px] h-[300px] shadow-[inset_0px_0px_80px_rgba(0,0,0,1),_inset_-5px_-5px_5px_rgba(255,255,255,0.7)]">
          <div className="h-full ml-16 flex gap-6">
            {Object.entries(wires).map(([id, wire]) => (
              <Wire key={id} id={id} wire={wire} cutWire={cutWire} />
            ))}
          </div>
          <div className="h-full w-max flex flex-col justify-between">
            <div className="w-max h-max bg-gray-200 rounded-tr-md rounded-bl-md">
              <div className="grid grid-cols-3 w-max m-4 gap-2">
                {numbers.map((number) => (
                  <NumPadButton key={number} number={number} inputCode={inputCode} />
                ))}
              </div>
              <div className="bg-black text-green-500 mono text-2xl m-4 text-center">
                {codeDisplay}
              </div>
            </div>
            <div className="w-full h-max bg-gray-200 rounded-br-md rounded-tl-md">
              <div className="bg-black text-red-500 mono text-4xl m-4 p-1 text-center">
                {timer === 60
                  ? '1:00'
                  : '0:' +
                    (timer.toString().length === 1 ? '0' + timer.toString() : timer.toString())}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul></ul>
      {message && (
        <div
          key={message}
          className="absolute -bottom-12 left-0 w-full px-4 py-2 rounded-lg text-white text-message select-none shadow-lg whitespace-pre-line origin-bottom"
          style={{ backgroundColor: '#32D74B' }}
        >
          {message}
        </div>
      )}
    </>
  )
}

const Wire = ({
  id,
  wire,
  cutWire,
}: {
  id: string
  wire: WireType
  cutWire: (id: string) => void
}) => {
  const { isCut, color } = wire
  const [isHovering, setIsHovering] = useState(false)
  return (
    <div
      className="flex flex-col items-center  cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => cutWire(id)}
    >
      <div className="h-5 w-5 bg-gray-900" />
      <div
        className={classNames(
          'h-full w-[10px] border-2 border-t-0 border-b-0 shadow-lg',
          { 'border-white': isHovering && !isCut },
          { '!h-[35%]': isCut },
          color
        )}
      />
      {isCut && (
        <div
          className={classNames(
            'mt-16 h-[35%] w-[10px]  border-2 border-t-0 border-b-0 shadow-lg',
            color
          )}
        />
      )}
      <div className="h-5 w-5 bg-gray-900" />
    </div>
  )
}

const NumPadButton = ({
  number,
  inputCode,
}: {
  number: number
  inputCode: (number: number) => void
}) => {
  return (
    <button
      className="border rounded-lg w-max px-2 text-2xl shadow-md bg-gray-100 mono select-none cursor-pointer active:shadow-[inset_0px_0px_20px_rgba(0,0,0,0.2),_inset_-5px_-5px_5px_rgba(255,255,255,0.7)]"
      onClick={() => inputCode(number)}
    >
      {number}
    </button>
  )
}

export const BombDefusalControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
