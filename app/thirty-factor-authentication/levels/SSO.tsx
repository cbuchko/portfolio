import { ContentProps, ControlProps } from './types'
import Image from 'next/image'

export const SSOContent = (
  {
    //   playerId,
    //   validateAdvance,
    //   cancelAdvance,
    //   handleLevelAdvance,
  }: ContentProps
) => {
  //   const [isModalActive, setIsModalActive] = useState(false)
  //   const [ssoChoice, setSSOChoice] = useState<string>()

  //   const handleSSOSelect = (type: string) => {
  //     setIsModalActive(true)
  //     setSSOChoice(type)
  //   }

  return (
    <>
      <h3 className="mb-2">Verify your identity through one of these other providers</h3>
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-3 place-items-center gap-y-4 gap-4 text-center">
          <SSOProvider title="Pinterest" url="/thirty-factor-authentication/sso/facebook.png" />
          <SSOProvider title="Spotify" url="/thirty-factor-authentication/sso/facebook.png" />
          <SSOProvider title="Twitter" url="/thirty-factor-authentication/sso/facebook.png" />
        </div>
      </div>
    </>
  )
}

const SSOProvider = ({ title, url }: { title: string; url: string }) => {
  return (
    <div className="flex items-center gap-2 py-1 px-2 border w-max rounded-md capitalize min-w-[125px] select-none cursor-pointer active:bg-gray-200">
      <Image src={url} alt="title" height={24} width={24} />
      {title}
    </div>
  )
}

export const SSOControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary"
        onClick={() => handleLevelAdvance()}
      ></button>
    </>
  )
}
