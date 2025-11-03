import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'

function makeCode(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const messages = [
  '',
  'hey what you up to?',
  'Mom and I would like to FaceTime.',
  'Message: Exclusive loyalty offer.',
  'can we talk about last night please???',
  'Jeff emphasized "lads we should get kbbq"',
  '😂😂😂',
  'Your phone bill is ready to be reviewed.',
]

export const MessageSpamContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [nameInput, setNameInput] = useState('')

  const [message, setMessage] = useState<string | null>(null)
  const codeRef = useRef(makeCode(14))
  const messageIndexRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  //every 5 seconds replace the message on screen with a new one
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const audio = new Audio('/thirty-factor-authentication/sounds/message.mp3')
      audio.volume = 0.2
      audio.play()
      //first message is always the code
      if (messageIndexRef.current === 0) {
        setMessage(`Your authentication code is: ${codeRef.current}`)
      } else {
        setMessage(messages[messageIndexRef.current])
      }
      //cycle to the next message
      if (messageIndexRef.current >= messages.length - 1) {
        messageIndexRef.current = 1
      } else messageIndexRef.current = messageIndexRef.current + 1
    }, 7500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleResendCode = () => {
    const audio = new Audio('/thirty-factor-authentication/sounds/message.mp3')
    audio.volume = 0.2
    audio.play()
    setMessage(`Your authentication code is: ${codeRef.current}`)
  }

  const handleInputChange = (input: string) => {
    setNameInput(input)
    if (codeRef.current === input) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <h3>{`We've sent a code to your mobile device.`}</h3>
      <div className="flex justify-between mt-2">
        <small>{`Don't tell this code to anyone.`}</small>
        <button className="text-xs underline cursor-pointer" onClick={handleResendCode}>
          Resend Code
        </button>
      </div>
      <input
        className="border w-full rounded-md mt-1 px-2 py-1"
        placeholder="Enter the code..."
        value={nameInput}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
      <ul></ul>
      {message && (
        <div
          key={message}
          className="absolute -bottom-12 left-0 w-full px-4 py-2 rounded-lg text-white text-message select-none shadow-lg"
          style={{ backgroundColor: '#32D74B' }}
        >
          {message}
        </div>
      )}
    </>
  )
}

export const MessageSpamControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
