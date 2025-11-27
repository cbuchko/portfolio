import { useEffect, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeAuthCode } from '../utils'
import { createPortal } from 'react-dom'
import { AppCode } from './AppCode'

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

  useEffect(() => {
    const portalElement = document.getElementById('extras-portal')
    setPortalElement(portalElement)
  }, [])

  return (
    <>
      <p className="text-lg">Enter the code from your Authenticator App</p>
      <input
        className="border w-full rounded-md mt-1 px-2 py-1"
        placeholder="Enter code..."
        value={codeInput}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
      {portalElement &&
        createPortal(
          <div className="flex flex-wrap justify-center mt-6">
            <AppCode
              title={'Thirty Factor Auth'}
              targetCode={targetCode}
              setTargetCode={setTargetCode}
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
