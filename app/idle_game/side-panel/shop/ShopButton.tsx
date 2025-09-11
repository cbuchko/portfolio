import classNames from 'classnames'
import { ShopItemIds } from './constants'

export type ShopButtonProps = {
  id: ShopItemIds
  title: string
  spendScore: () => void
  setHoveredId: (id?: ShopItemIds) => void
  isDisabled?: boolean
}

export const ShopButton = ({
  id,
  title,
  isDisabled,
  spendScore,
  setHoveredId,
}: ShopButtonProps) => {
  return (
    <button
      className={classNames('shop-button whitespace-nowrap hover:bg-gray-300', {
        '!border-gray-400 hover:!bg-white hover:!border-red-500': isDisabled,
        'cursor-pointer': !isDisabled,
      })}
      onClick={spendScore}
      onMouseEnter={() => setHoveredId(id)}
      onMouseLeave={() => setHoveredId(undefined)}
    >
      {title}
    </button>
  )
}
