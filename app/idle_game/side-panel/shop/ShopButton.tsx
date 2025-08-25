import { ShopItemIds } from './constants'

export type ShopButtonProps = {
  id: ShopItemIds
  title: string
  spendScore: () => void
  setHoveredId: (id?: ShopItemIds) => void
}

export const ShopButton = ({ id, title, spendScore, setHoveredId }: ShopButtonProps) => {
  return (
    <div>
      <button
        className="shop-button"
        onClick={spendScore}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(undefined)}
      >
        {title}
      </button>
    </div>
  )
}
