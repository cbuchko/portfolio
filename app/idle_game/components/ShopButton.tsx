type ShopButtonProps = {
  title: string
  cost: number
  spendScore: () => void
}

export const ShopButton = ({ title, cost, spendScore }: ShopButtonProps) => {
  return (
    <div className="">
      <button className="shop-button" onClick={spendScore}>
        {title}
      </button>
      <h5>Costs {cost}</h5>
    </div>
  )
}
