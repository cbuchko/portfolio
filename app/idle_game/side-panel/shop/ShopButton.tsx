import { ShopButtonIds } from './constants'

export type ShopButtonProps = {
  id: ShopButtonIds
  title: string
  cost: number
  spendScore: () => void
  setHoveredId: (id?: ShopButtonIds) => void
}

export const ShopButton = ({ id, title, cost, spendScore, setHoveredId }: ShopButtonProps) => {
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
      <h5>Costs {cost}</h5>
    </div>
  )
}
