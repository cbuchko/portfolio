import { useState } from 'react'
import { Spotify } from './Spotify'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'

enum SSOIds {
  spotify = 'spotify',
}

export const SSOContent = ({ handleLevelAdvance }: ContentProps) => {
  const [SSOChoice, setSSOChoice] = useState<SSOIds | null>(null)

  return (
    <>
      {SSOChoice === null && (
        <>
          <h3 className="mb-2">Verify your identity through one of these other providers</h3>
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-3 place-items-center gap-y-4 gap-4 text-center">
              <SSOProvider title="Pinterest" url="/thirty-factor-authentication/sso/facebook.png" />
              <SSOProvider
                title="Spotify"
                url="/thirty-factor-authentication/sso/facebook.png"
                onClick={() => setSSOChoice(SSOIds.spotify)}
              />
              <SSOProvider title="Twitter" url="/thirty-factor-authentication/sso/facebook.png" />
            </div>
          </div>
        </>
      )}
      {SSOChoice === SSOIds.spotify && <Spotify handleLevelAdvance={handleLevelAdvance} />}
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
      <Image src={url} alt="title" height={24} width={24} />
      {title}
    </div>
  )
}
