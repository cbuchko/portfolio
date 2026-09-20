import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeCode } from '../utils'
import { useMessageSpam } from '../useMessageSpam'
import { TextInput } from '../components/TextInput'
import { ExtrasPortal } from '../components/ExtrasPortal'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { captureTfaHelperUsed, setTfaAttemptContext } from '../analytics'

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
  const [codeInput, setCodeInput] = useState('')
  const [code, setCode] = useState('')
  const [resends, setResends] = useState(0)

  useEffectInitializer(() => {
    setCode(makeCode(10))
    setTfaAttemptContext({ code_len: 0, resends_this_level: 0 })
  }, [])

  const authMessage = code ? `Your authentication code is: ${code}` : undefined
  const { message, handleResendCode } = useMessageSpam(messages, authMessage)

  const onResend = () => {
    const next = resends + 1
    setResends(next)
    setTfaAttemptContext({ code_len: codeInput.length, resends_this_level: next })
    captureTfaHelperUsed('sms_resend', { resends_this_level: next })
    handleResendCode()
  }

  const handleInputChange = (input: string) => {
    setCodeInput(input)
    setTfaAttemptContext({ code_len: input.length, resends_this_level: resends })
    if (code === input) {
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
        <button className="text-xs underline cursor-pointer" onClick={onResend}>
          Resend Code
        </button>
      </div>
      <TextInput
        value={codeInput}
        placeholder="Enter the code..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />
      {message && (
        <ExtrasPortal>
          <div
            key={message}
            className="w-[var(--tfa-auth-width,100%)] px-4 py-2 rounded-lg text-white text-message select-none shadow-lg bg-[#27ad3b]"
          >
            {code && message === authMessage ? (
              <>
                {'Your authentication code is: '}
                <span className="mono inline-block rounded px-1.5 font-semibold tracking-[0.16em]">
                  {code}
                </span>
              </>
            ) : (
              message
            )}
          </div>
        </ExtrasPortal>
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
