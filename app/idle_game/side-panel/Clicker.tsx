import classNames from 'classnames'
import { ShopItemIds } from './shop/constants'
import { useCallback, useEffect, useRef } from 'react'

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

  const handleClick = useCallback(() => {
    if (purchasedIds.includes(ShopItemIds.buttonSFX)) {
      const audio = new Audio('/idle_game/click.mp3')
      audio.volume = 0.5
      audio.play()
    }
    onClick()
  }, [purchasedIds])

  return (
    <button
      ref={clickerRef}
      className={classNames('click-button w-full', {
        'shadow-md shadow-black/50 hover:scale-105 transition-all': purchasedIds.includes(
          ShopItemIds.basicButton
        ),
      })}
      onClick={handleClick}
    >
      Click Me!
    </button>
  )
}
