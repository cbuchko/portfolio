import { useState } from 'react'
import { Spotify } from './Spotify'
import { ContentProps } from './types'
import Image from 'next/image'
import { SelfCheckoutContent } from './SelfCheckout'

export enum SSOIds {
  spotify = 'spotify',
  walmart = 'walmart',
  facebook = 'facebook',
}

export const SSOContent = (props: ContentProps) => {
  const { selectedSSOIds, setSelectedSSOIds } = props
  const [SSOChoice, setSSOChoice] = useState<SSOIds | null>(null)

  const handleSSOChoice = (id: SSOIds) => {
    setSSOChoice(id)
    setSelectedSSOIds((prevIds) => {
      const newIds = new Set(prevIds)
      newIds.add(id)
      return newIds
    })
  }

  const getMessage = () => {
    if (selectedSSOIds.size === 0) {
      return 'Verify your identity through one of these other providers.'
    }
    if (selectedSSOIds.size === 1) {
      return "Sorry your last selection didn't work, please select another provider."
    }
    return 'One last time, please verify through this provider.'
  }
  const message = getMessage()
  return (
    <>
      {SSOChoice === null && (
        <>
          <h3 className="mb-2">{message}</h3>
          <div className="w-full flex justify-center">
            <div className="flex flex-row justify-around gap-y-4 gap-4 text-center">
              {/* {!selectedSSOIds.has(SSOIds.facebook) && (
                <SSOProvider
                  title="Facebook"
                  url="/thirty-factor-authentication/sso/facebook.png"
                />
              )} */}
              {!selectedSSOIds.has(SSOIds.spotify) && (
                <SSOProvider
                  title="Spotify"
                  url="/thirty-factor-authentication/sso/spotify.png"
                  onClick={() => handleSSOChoice(SSOIds.spotify)}
                />
              )}
              {!selectedSSOIds.has(SSOIds.walmart) && (
                <SSOProvider
                  title="Walmart"
                  url="/thirty-factor-authentication/sso/wallmart.jpg"
                  onClick={() => handleSSOChoice(SSOIds.walmart)}
                />
              )}
            </div>
          </div>
        </>
      )}
      {SSOChoice === SSOIds.spotify && <Spotify handleLevelAdvance={props.handleLevelAdvance} />}
      {SSOChoice === SSOIds.walmart && <SelfCheckoutContent {...props} />}
    </>
  )
}

const SSOProvider = ({
  title,
  url,
  onClick,
}: {
  title: string
  url: string
  onClick: () => void
}) => {
  return (
    <div
      className="flex items-center gap-2 py-1 px-2 border w-max rounded-md capitalize min-w-[125px] select-none cursor-pointer active:bg-gray-200"
      onClick={onClick}
    >
      <Image
        className="rounded-lg w-6 aspect-square"
        src={url}
        alt="title"
        height={24}
        width={24}
      />
      {title}
    </div>
  )
}
