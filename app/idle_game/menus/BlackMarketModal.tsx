import { BlackMarketPacks } from '../side-panel/shop/constants'
import { Rarity, RarityColors } from '../view/constants'
import { ModalContainer } from './ModalContainer'
import { ModalNames } from './modalRegistry'
import StarIcon from '@/public/idle_game/star.svg'

export const BlackMarketModal = ({
  setActiveModal,
}: {
  setActiveModal: (modal?: ModalNames) => void
}) => {
  return (
    <ModalContainer setActiveModal={setActiveModal}>
      <h4 className="text-2xl mb-4">Black Market</h4>
      <div className="mt-4">
        {BlackMarketPacks.map((pack) => {
          return (
            <BlackMarketItem
              rarity={pack.rarity}
              title={pack.title}
              description={pack.description}
              price={pack.price}
            />
          )
        })}
      </div>
      <div className="text-sm text-gray-600 italic">
        The shopkeeper barely makes eye contact and seems focused on making sure you touch nothing.
      </div>
    </ModalContainer>
  )
}

const BlackMarketItem = ({
  rarity,
  title,
  description,
  price,
}: {
  rarity: Rarity
  title: string
  description: string
  price: number
}) => {
  return (
    <div className="flex my-4 border-b border-gray-300 pb-4 gap-4 items-center">
      <StarIcon style={{ color: RarityColors[rarity] }} className="w-10 h-10" />
      <div>
        <h5 className="font-medium">{title}</h5>
        <h5 className="text-sm">{description}</h5>
        <div className="flex justify-between items-end mt-4">
          <h5 className="font-medium">{price.toLocaleString('en-us')} Score</h5>
          <button className="border p-2 rounded-md cursor-pointer">BUY NOW</button>
        </div>
      </div>
    </div>
  )
}
