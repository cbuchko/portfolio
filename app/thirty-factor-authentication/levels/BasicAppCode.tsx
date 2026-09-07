import { useCallback, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeAuthCode } from '../utils'
import { AppCode } from './AppCode'
import { PinInput } from '../components/PinInput'
import { ExtrasPortal } from '../components/ExtrasPortal'

export const BasicAppCodeContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [targetCode, setTargetCode] = useState(makeAuthCode(6))
  const [codeInput, setCodeInput] = useState('')

  const handleInputChange = (input: string) => {
    setCodeInput(input)
    if (targetCode.toLocaleLowerCase() === input.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  const handleTargetSet = useCallback(
    (code: string) => {
      setTargetCode(code)
      cancelAdvance()
    },
    [cancelAdvance]
  )

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
