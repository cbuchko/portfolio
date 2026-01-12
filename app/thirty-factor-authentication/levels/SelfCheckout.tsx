import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { ContentProps } from './types'
import { useDrag, useDrop } from 'react-dnd'
import classNames from 'classnames'
import Image from 'next/image'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

type ShoppingItem = {
  id: string
  url: string
  title: string
  cost: number
  isBagged?: boolean
  isScanned?: boolean
}

const getErrorText = (
  isUnexpectedError: boolean,
  isUnbaggedItem: boolean,
  isAgeVerificationError: boolean
) => {
  if (isUnexpectedError) return 'UNEXPECTED ITEM IN BAGGING AREA.'
  if (isUnbaggedItem) return 'PLACE ITEM IN BAGGING AREA.'
  if (isAgeVerificationError) return 'AGE VERIFICATION REQUIRED'
}

const ShoppingItems: ShoppingItem[] = [
  {
    id: 'banana',
    title: 'Banana',
    cost: 10,
    url: '/thirty-factor-authentication/groceries/banana.webp',
  },
  {
    id: 'milk',
    title: 'Milk',
    cost: 5.99,
    url: '/thirty-factor-authentication/groceries/milk.webp',
  },
  {
    id: 'cheese',
    title: 'Cheese',
    cost: 11.99,
    url: '/thirty-factor-authentication/groceries/cheese.png',
  },
  {
    id: 'eggs',
    title: 'Eggs',
    cost: 19.99,
    url: '/thirty-factor-authentication/groceries/egg-carton.png',
  },
  {
    id: 'chocolate',
    title: 'Chocolate',
    cost: 3.99,
    url: '/thirty-factor-authentication/groceries/chocolate.png',
  },
  {
    id: 'peanut',
    title: 'Peanut Butter',
    cost: 5.45,
    url: '/thirty-factor-authentication/groceries/peanut.png',
  },
  { id: 'wine', title: 'Wine', cost: 10, url: '/thirty-factor-authentication/groceries/wine.png' },
  {
    id: 'bread',
    title: 'Bread',
    cost: 6.99,
    url: '/thirty-factor-authentication/groceries/bread.png',
  },

  {
    id: 'cookie',
    title: 'Cookie',
    cost: 2.5,
    url: '/thirty-factor-authentication/groceries/cookie.png',
  },
]

export const SelfCheckoutContent = ({
  handleLevelAdvance,
  cancelAdvance,
  isMobile,
}: ContentProps) => {
  const [items, setItems] = useState(ShoppingItems)
  const scannedIdsRef = useRef<Set<string>>(new Set())
  const [isAgeVerified, setIsAgeVerified] = useState(false)

  const handleDrop = (droppedItem: ShoppingItem, isBaggingArea?: boolean) => {
    setItems((prevItems) => {
      const arrayCopy = new Array(...prevItems)
      const index = arrayCopy.findIndex((item) => item.id === droppedItem.id)
      arrayCopy[index] = {
        ...droppedItem,
        isBagged: isBaggingArea,
        isScanned: scannedIdsRef.current.has(droppedItem.id),
      }
      return arrayCopy
    })
  }

  const handleScan = (scannedItem: ShoppingItem) => {
    const ids = scannedIdsRef.current
    ids.add(scannedItem.id)
    scannedIdsRef.current = ids
    setItems((prevItems) => {
      const arrayCopy = new Array(...prevItems)
      const index = arrayCopy.findIndex((item) => item.id === scannedItem.id)
      arrayCopy[index] = { ...scannedItem, isScanned: true }
      return arrayCopy
    })
  }

  useEffect(() => {
    const checkoutComplete = items.every((item) => item.isBagged && item.isScanned)
    if (checkoutComplete) {
      handleLevelAdvance(true)
      return
    }
    cancelAdvance()
  }, [items, cancelAdvance, handleLevelAdvance])

  const [cartItems, baggedItems, scannedItems] = useMemo(() => {
    const cartItems = items.filter((item) => !item.isBagged)
    const baggedItems = items.filter((item) => !!item.isBagged)
    const scannedItems = items.filter((item) => !!item.isScanned)
    return [cartItems, baggedItems, scannedItems]
  }, [items])

  const isUnexpectedItemError = baggedItems.some((item) => !item.isScanned)
  const isUnbaggedItemError = scannedItems.some((item) => cartItems.find((i) => item.id === i.id))
  const isAgeVerificationError = baggedItems.some(
    (item) => item.id === 'wine' && item.isScanned && !isAgeVerified
  )
  const isAnyError = isUnexpectedItemError || isUnbaggedItemError || isAgeVerificationError
  return (
    <>
      <p className="text-lg">
        To verify yourself as a member of our Walmart Rewards Program, please demonstrate how to use
        a Self-Checkout.
      </p>
      <div className={classNames('flex gap-10 mt-8', { 'flex-col items-center': isMobile })}>
        <DropArea
          title="Shopping Cart"
          handleDrop={(item) => handleDrop(item, false)}
          items={cartItems}
        />
        <div>
          <Scanner handleScan={handleScan} scannedIds={scannedIdsRef} />
          {!isMobile && (
            <div className="mt-4">
              <h5 className="text-center">Summary</h5>
              <div className="border p-2 h-[160px]">
                {scannedItems.map((item) => {
                  return (
                    <div key={item.id} className="text-xs flex justify-between">
                      <p>{item.title}</p>
                      <p>{`$${item.cost.toFixed(2)}`}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <DropArea
          title="Bagging Area"
          handleDrop={(item) => handleDrop(item, true)}
          items={baggedItems}
        />
        {isMobile && (
          <div className="mt-4">
            <h5 className="text-center">Summary</h5>
            <div className="border p-2 h-[160px] w-[200px]">
              {scannedItems.map((item) => {
                return (
                  <div key={item.id} className="text-xs flex justify-between">
                    <p>{item.title}</p>
                    <p>{`$${item.cost.toFixed(2)}`}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {isAnyError && (
        <ErrorContainer
          text={getErrorText(isUnexpectedItemError, isUnbaggedItemError, isAgeVerificationError)}
          isAgeVerificationError={isAgeVerificationError}
          setIsAgeVerified={setIsAgeVerified}
          isMobile={isMobile}
        />
      )}
    </>
  )
}

const CheckoutItem = ({ item }: { item: ShoppingItem }) => {
  const dragRef = useRef<HTMLImageElement>(null)

  const [{ opacity }, drag] = useDrag(
    () => ({
      type: 'checkout-item',
      item: item,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0 : 1,
      }),
    }),
    []
  )
  useEffect(() => {
    if (dragRef.current) {
      drag(dragRef)
    }
  }, [drag])

  return (
    <div className="flex items-center justify-center cursor-pointer">
      <Image
        ref={dragRef}
        height={'80'}
        width={'80'}
        alt={item.title}
        src={item.url}
        className={classNames('h-20 w-max p-2 m-1')}
        style={{ opacity }}
      />
    </div>
  )
}

const DropArea = ({
  title,
  items,
  handleDrop,
}: {
  title: string
  items: ShoppingItem[]
  handleDrop: (item: ShoppingItem) => void
}) => {
  const dropRef = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop(
    () => ({ accept: 'checkout-item', drop: handleDrop }),
    [handleDrop, items]
  )
  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef)
    }
  }, [drop])
  return (
    <div ref={dropRef}>
      <h5 className="text-center">{title}</h5>
      <div className="border h-[300px] w-[300px] grid grid-cols-3">
        {items.map((item) => (
          <CheckoutItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

const Scanner = ({
  scannedIds,
  handleScan,
}: {
  scannedIds: RefObject<Set<string>>
  handleScan: (item: ShoppingItem) => void
}) => {
  const dropRef = useRef<HTMLDivElement>(null)

  const [isSuccess, setIsSuccess] = useState(false)
  //is the scan actively happening
  const [isScanning, setIsScanning] = useState(false)
  //is the item hovered over
  const scanningRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  const updateScanning = (isScanning: boolean) => {
    setIsScanning(isScanning)
    scanningRef.current = isScanning
  }

  const attemptScan = (item: ShoppingItem) => {
    if (scanningRef.current || scannedIds.current.has(item.id)) return
    updateScanning(true)

    const max = 2000
    const min = 2000
    const timeoutDuration = Math.random() * (max - min) + min
    timeoutRef.current = setTimeout(() => {
      if (scanningRef.current) handleScan(item)
      setIsScanning(false)
      setIsSuccess(true)
    }, timeoutDuration)
  }

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'checkout-item',
      hover: attemptScan,
      collect: (monitor) => ({
        isOver: monitor.isOver(), // This will be false when unhovered
      }),
    }),
    [isScanning, scannedIds]
  )

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef)
    }
  }, [drop])

  useEffectInitializer(() => {
    scanningRef.current = isOver
    if (!isOver && isScanning) {
      updateScanning(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    if (!isOver && isSuccess) {
      setIsSuccess(false)
    }
  }, [isOver, isScanning, isSuccess])

  return (
    <div
      ref={dropRef}
      className={classNames('border h-[100px] w-[200px] mt-6 bg-gray-500 opacity-50', {
        '!bg-green-400': isSuccess,
      })}
    >
      {isScanning && <div className="bg-green-400 w-3 h-full scan-swipe pointer-events-none" />}
    </div>
  )
}

const ErrorContainer = ({
  text,
  isAgeVerificationError,
  setIsAgeVerified,
  isMobile,
}: {
  text?: string
  isAgeVerificationError?: boolean
  setIsAgeVerified: (isVerified: boolean) => void
  isMobile?: boolean
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2
    }
  }, [])

  return (
    <>
      <div className="fixed w-screen h-screen top-0 left-0 bg-red-500 error-container pointer-events-none" />
      <div
        className={classNames(
          'fixed flex flex-col items-center text-[100px] top-[75%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-center text-black z-100 pointer-events-none',
          { '!text-[50px] !top-[50%]': isMobile }
        )}
      >
        {text}
        {isAgeVerificationError && (
          <button
            className="border text-2xl bg-white p-2 rounded-md cursor-pointer w-max !pointer-events-auto"
            onClick={() => setIsAgeVerified(true)}
          >
            REQUEST ASSISTANCE
          </button>
        )}
      </div>

      <audio
        ref={audioRef}
        controls={false}
        src="/thirty-factor-authentication/sounds/siren.mp3"
        autoPlay
        loop
      />
    </>
  )
}
