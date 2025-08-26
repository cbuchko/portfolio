import classNames from 'classnames'
import { ShopItemIds } from './shop/constants'
import { useEffect, useRef } from 'react'

type ClickerProps = {
  purchasedIds: Array<ShopItemIds>
  onClick: () => void
}

export const Clicker = ({ purchasedIds, onClick }: ClickerProps) => {
  const clickerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const clicker = clickerRef.current
    if (!clicker || !purchasedIds.includes(ShopItemIds.basicButton)) return
    clicker.addEventListener('click', () => {
      clicker.classList.remove('gyrate') // reset if already applied
      void clicker.offsetWidth // forces reflow so animation can retrigger
      clicker.classList.add('gyrate')
    })
  }, [purchasedIds])

  return (
    <button
      ref={clickerRef}
      className={classNames('click-button w-full', {
        'shadow-md shadow-black/50 hover:scale-105 transition-all': purchasedIds.includes(
          ShopItemIds.basicButton
        ),
      })}
      onClick={onClick}
    >
      Click Me!
    </button>
  )
}
