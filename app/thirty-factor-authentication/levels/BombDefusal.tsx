import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { useMessageSpam } from '../useMessageSpam'
import { useSound } from '@/app/utils/useSounds'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

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

enum WireIds {
  red = 'red',
  yellow = 'yellow',
  white = 'white',
  blue = 'blue',
  purple = 'purple',
}

const Wires: Record<WireIds, WireType> = {
  red: { color: 'bg-red-500' },
  yellow: { color: 'bg-yellow-300' },
  white: { color: 'bg-white' },
  blue: { color: 'bg-blue-500' },
  purple: { color: 'bg-purple-500' },
}

type Instruction = {
  wireId?: WireIds
  number?: number
  timeSpecification?: number
}

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

//five wires and four numpad inputs
const instructionCount = 9

const maxTimeInSeconds = 30
export const BombDefusalContent = ({ validateAdvance, handleLevelAdvance }: ContentProps) => {
  const [wires, setWires] = useState(Wires)
  const [code, setCode] = useState('')

  const [timer, setTimer] = useState(maxTimeInSeconds)
  const [isGameOver, setIsGameOver] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { playSound: playExplosionSound } = useSound(
    '/thirty-factor-authentication/sounds/explosion.mp3',
    0.3
  )

  const [instructionStepIndex, setInstructionStepIndex] = useState(0)
  const [instructions, formattedInstructions] = useMemo(() => {
    const instructions = generateInstructions()
    const formattedInstructions = formatInstructions(instructions)
    if (isGameOver) return [instructions, formattedInstructions]
    return [instructions, formattedInstructions]
  }, [isGameOver])

  const { message, handleResendCode } = useMessageSpam(messages, formattedInstructions, 4000)

  //countdown
  useEffect(() => {
    if (isGameOver) return
    timerRef.current = setInterval(() => {
      setTimer((time) => time - 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isGameOver])

  const resetGame = useCallback(() => {
    setTimer(maxTimeInSeconds)
    setWires(Wires)
    setCode('')
    setIsGameOver(false)
    setInstructionStepIndex(0)
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play()
  }, [])

  const handleExplosion = useCallback(() => {
    playExplosionSound()
    audioRef.current?.pause()
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsGameOver(true)
    handleLevelAdvance()
    setTimeout(() => {
      resetGame()
    }, 4000)
  }, [handleLevelAdvance, resetGame, playExplosionSound])

  useEffectInitializer(() => {
    if (timer === 0 && !isGameOver) {
      handleExplosion()
    }
  }, [timer, handleExplosion, isGameOver])

  const handleDefusalStep = (wireId?: WireIds, number?: number) => {
    const expectedInstruction = instructions[instructionStepIndex]
    if (expectedInstruction.wireId !== wireId) {
      handleExplosion()
      return
    }
    if (expectedInstruction.number !== number) {
      handleExplosion()
      return
    }
    setInstructionStepIndex((index) => (index = index + 1))
    if (instructionStepIndex >= instructions.length - 1) {
      validateAdvance()
      if (timerRef.current) clearInterval(timerRef.current)
      audioRef.current?.pause()
    }
  }

  const cutWire = (id: WireIds) => {
    setWires((prevWires) => ({
      ...prevWires,
      [id]: { ...prevWires[id], isCut: true },
    }))
    handleDefusalStep(id)
  }

  const inputCode = (number: number) => {
    if (code.length >= 4) return
    setCode((prevCode) => prevCode + number.toString())
    handleDefusalStep(undefined, number)
  }

  const codeDisplay = code.padStart(4, '0')
  return (
    <>
      <p className="text-lg">{`We've sent instructions to defuse this bomb to your mobile device.`}</p>
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
              <Wire key={id} id={id as WireIds} wire={wire} cutWire={cutWire} />
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
                {timer < 0
                  ? '0:00'
                  : '0:' + (timer.toString().length === 1 ? '0' + timer : timer.toString())}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul></ul>
      {message && (
        <div
          key={message}
          className="absolute -bottom-3 translate-y-[100%] left-0 w-full px-4 py-2 rounded-lg text-white text-message select-none shadow-lg whitespace-pre-line origin-bottom bg-[#27ad3b]"
        >
          {message}
        </div>
      )}
      <audio
        src="/thirty-factor-authentication/sounds/bomb-defusal.m4a"
        autoPlay
        loop
        ref={audioRef}
      />
      {isGameOver && <div className="fixed top-0 left-0 h-screen w-screen bg-red-500/50 " />}
    </>
  )
}

const Wire = ({
  id,
  wire,
  cutWire,
}: {
  id: WireIds
  wire: WireType
  cutWire: (id: WireIds) => void
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

//generates the win condition by ordering the different steps (need to cut 5 wires and enter 4 numbers)
const generateInstructions = (): Instruction[] => {
  const instructions: Instruction[] = []
  let wireIds = [WireIds.red, WireIds.blue, WireIds.purple, WireIds.yellow, WireIds.white]

  let numbersAdded = 0
  for (let i = 0; i < instructionCount; i++) {
    const isWire = wireIds.length > 0 && Math.random() > 0.5
    //is wire
    if (isWire || numbersAdded >= 4) {
      const wireId = wireIds[Math.floor(Math.random() * wireIds.length)]
      instructions[i] = { wireId }
      wireIds = wireIds.filter((id) => id !== wireId)
      continue
    }
    //is number
    const number = numbers[Math.floor(Math.random() * numbers.length)]
    instructions[i] = { number }
    numbersAdded++
  }

  return instructions
}

//turn the instructions into a string
const formatInstructions = (instructions: Instruction[]): string => {
  let instructionsFormatted = 'Carefully follow these instructions to defuse the bomb: \n\n'

  let instructionNumber = 1
  for (const instruction of instructions) {
    if (instruction.wireId) {
      instructionsFormatted += `${instructionNumber}. Cut the ${instruction.wireId} wire\n`
    }
    if (instruction.number) {
      instructionsFormatted += `${instructionNumber}. Enter the number ${instruction.number}\n`
    }
    instructionNumber++
  }
  return instructionsFormatted
}
