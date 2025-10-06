import { ModalContainer } from './ModalContainer'
import { ModalNames } from './modalRegistry'

export const SettingsModal = ({
  setActiveModal,
}: {
  setActiveModal: (modal?: ModalNames) => void
}) => {
  return (
    <ModalContainer setActiveModal={setActiveModal}>
      <h4 className="text-2xl mb-4">Settings</h4>
      <div className="">
        <h5>Mute Audio</h5>
        <input type="checkbox" />
      </div>
    </ModalContainer>
  )
}
