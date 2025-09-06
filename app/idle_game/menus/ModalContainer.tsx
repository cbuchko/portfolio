import Image from 'next/image'
import { ModalNames } from './modalRegistry'
import { PropsWithChildren } from 'react'

export const ModalContainer = ({
  children,
  setActiveModal,
}: PropsWithChildren & {
  setActiveModal: (modal?: ModalNames) => void
}) => {
  return (
    <>
      <div className="absolute bg-white max-w-[500px] min-w-[400px] border shadow-lg left-[50%] -translate-x-[50%] top-[35%] -translate-y-[50%] py-4 px-6 rounded-lg z-10">
        <Image
          className="absolute top-6 right-6 cursor-pointer"
          src="/idle_game/close.svg"
          alt="close"
          height={20}
          width={20}
          onClick={() => setActiveModal(undefined)}
        />
        {children}
      </div>
      <div
        className="fixed w-screen h-screen bg-black/60 cursor-pointer"
        onClick={() => setActiveModal(undefined)}
      />
    </>
  )
}
