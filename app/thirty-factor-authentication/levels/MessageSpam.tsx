import { useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeCode } from '../utils'
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

export const MessageSpamContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [nameInput, setNameInput] = useState('')
  const codeRef = useRef(makeCode(12))

  const { message, handleResendCode } = useMessageSpam(
    messages,
    `Your authentication code is: ${codeRef.current}`
  )

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
      <p className="text-lg">{`We've sent a code to your mobile device.`}</p>
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
      {message && (
        <div
          key={message}
          className="absolute -bottom-12 left-0 w-full px-4 py-2 rounded-lg text-white text-message select-none shadow-lg "
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
