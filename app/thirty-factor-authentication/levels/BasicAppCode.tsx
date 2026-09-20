import { useCallback, useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeAuthCode } from '../utils'
import { AppCode } from './AppCode'
import { PinInput } from '../components/PinInput'
import { ExtrasPortal } from '../components/ExtrasPortal'
import { setTfaAttemptContext } from '../analytics'

const syncAppCodeAttempt = (input: string, current: string, previous: string) => {
  const len = input.length
  const lower = input.toLocaleLowerCase()
  const now = current.toLocaleLowerCase()
  const prev = previous.toLocaleLowerCase()
  let attempt_kind: 'incomplete' | 'stale' | 'wrong' = 'wrong'
  if (len < 6) attempt_kind = 'incomplete'
  else if (prev && lower === prev && lower !== now) attempt_kind = 'stale'
  setTfaAttemptContext({ attempt_kind, code_len: len })
}

export const BasicAppCodeContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [targetCode, setTargetCode] = useState(makeAuthCode(6))
  const [codeInput, setCodeInput] = useState('')
  const previousCodeRef = useRef('')

  const handleInputChange = (input: string) => {
    setCodeInput(input)
  }

  useEffect(() => {
    syncAppCodeAttempt(codeInput, targetCode, previousCodeRef.current)
    if (targetCode.toLocaleLowerCase() === codeInput.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [targetCode, codeInput, validateAdvance, cancelAdvance])

  const handleTargetSet = useCallback((code: string) => {
    setTargetCode((current) => {
      previousCodeRef.current = current
      return code
    })
  }, [])

  return (
    <>
      <p className="text-lg">Enter the code from your Authenticator App.</p>
      <PinInput value={codeInput} onChange={handleInputChange} onSubmit={handleLevelAdvance} />
      <ExtrasPortal>
        <div className="flex w-full flex-wrap justify-center">
          <AppCode
            title={'Thirty Factor Auth'}
            codeDefault={targetCode}
            isTarget={true}
            setTargetCode={handleTargetSet}
            duration={8}
          />
        </div>
      </ExtrasPortal>
    </>
  )
}

export const BasicAppCodeControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
