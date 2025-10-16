import classNames from 'classnames'
import { BlackMarketPacks } from '../side-panel/shop/constants'
import { ScoreProps } from '../side-panel/useScore'
import { MemeProps } from '../useMemes'
import { Rarity, RarityColors } from '../view/constants'
import { ModalContainer } from './ModalContainer'
import { ModalNames } from './modalRegistry'
import StarIcon from '@/public/idle_game/icons/star.svg'

export const BlackMarketModal = ({
  memeProps,
  scoreProps,
  setActiveModal,
}: {
  memeProps: MemeProps
  scoreProps: ScoreProps
  setActiveModal: (modal?: ModalNames) => void
}) => {
  const getOutOfStock = (rarity: Rarity) => {
    if (rarity === Rarity.common) return memeProps.isCommonMaxed
    if (rarity === Rarity.rare) return memeProps.isRareMaxed
    if (rarity === Rarity.legendary) return memeProps.isLegendaryMaxed
    return false
  }
  return (
    <ModalContainer setActiveModal={setActiveModal}>
      <h4 className="text-2xl mb-4">Black Market</h4>
      <div className="mt-4">
        {BlackMarketPacks.map((pack, idx) => {
          return (
            <BlackMarketItem
              key={idx}
              rarity={pack.rarity}
              title={pack.title}
              description={pack.description}
              price={pack.price}
              handlePurchase={() => {
                scoreProps.spendScore(pack.price, () => {
                  if (pack.rarity === Rarity.common) memeProps.buyStandardPack()
                  if (pack.rarity === Rarity.rare) memeProps.buyUnusualPack()
                  if (pack.rarity === Rarity.legendary) memeProps.buyLegendaryPack()
                  setActiveModal(undefined)
                })
              }}
              isOutOfStock={getOutOfStock(pack.rarity)}
            />
          )
        })}
      </div>
      <div className="text-sm text-gray-600 italic">
        The shopkeeper barely makes eye contact and seems focused on ensuring you touch nothing.
      </div>
    </ModalContainer>
  )
}

const BlackMarketItem = ({
  rarity,
  title,
  description,
  price,
  handlePurchase,
  isOutOfStock,
}: {
  rarity: Rarity
  title: string
  description: string
  price: number
  handlePurchase: () => void
  isOutOfStock?: boolean
}) => {
  return (
    <div className="flex my-4 border-b border-gray-300 pb-4 gap-4 items-center w-full">
      <StarIcon style={{ color: RarityColors[rarity] }} className="w-10 h-10" />
      <div className="w-full">
        <h5 className="font-medium">{title}</h5>
        <h5 className="text-sm w-full">{description}</h5>
        <div className="flex justify-between items-end mt-4">
          <h5 className={classNames('font-medium', { 'line-through': isOutOfStock })}>
            {price.toLocaleString('en-us')} Score
          </h5>

          {!isOutOfStock && (
            <button
              className={classNames('border p-2 rounded-md cursor-pointer')}
              onClick={handlePurchase}
            >
              BUY NOW
            </button>
          )}
          {isOutOfStock && <h5 className="text-red-500 font-medium">OUT OF STOCK</h5>}
        </div>
      </div>
    </div>
  )
}
