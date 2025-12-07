import { useCallback, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeAuthCode } from '../utils'
import { createPortal } from 'react-dom'
import { AppCode } from './AppCode'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

export const BasicAppCodeContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [targetCode, setTargetCode] = useState(makeAuthCode(6))
  const [codeInput, setCodeInput] = useState('')
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  const handleInputChange = (input: string) => {
    setCodeInput(input)
    if (targetCode.toLocaleLowerCase() === input.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  useEffectInitializer(() => {
    const portalElement = document.getElementById('extras-portal')
    setPortalElement(portalElement)
  }, [])

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
      <TextInput
        value={codeInput}
        placeholder="Enter code..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />
      {portalElement &&
        createPortal(
          <div className="flex flex-wrap justify-center mt-6">
            <AppCode
              title={'Thirty Factor Auth'}
              codeDefault={targetCode}
              isTarget={true}
              setTargetCode={handleTargetSet}
              duration={3}
            />
          </div>,
          portalElement
        )}
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
