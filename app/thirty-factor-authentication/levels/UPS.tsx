import { useEffect, useMemo, useRef } from 'react'
import { ContentProps, ControlProps } from './types'
import { addMinutesToDate, getFormattedDate, makeCode } from '../utils'
import classNames from 'classnames'
import Image from 'next/image'

export const UPSContent = ({
  validateAdvance,
  upsTrackingCode: code,
  setUPSTrackingCode: setCode,
  isMobile,
}: ContentProps) => {
  const [deliveryStart, deliveryEnd] = useMemo(() => {
    const dateNow = new Date()
    const formattedNow = getFormattedDate(dateNow)
    const plusTenMinutes = addMinutesToDate(dateNow, 10)
    const formattedPlusTen = getFormattedDate(plusTenMinutes)
    return [formattedNow, formattedPlusTen]
  }, [])

  useEffect(() => {
    validateAdvance()
    if (!!code) return
    const newCode = makeCode(16)
    setCode(newCode)
  }, [setCode, validateAdvance, code])

  return (
    <>
      <p className="text-lg">
        To ensure the most secure authentication possible, we will be mailing a physical
        authentication key to you.
      </p>
      <p className="text-lg">
        You may proceed with the next levels while you wait. We appreciate your patience.
      </p>
      <div
        className={classNames('flex gap-12 mt-8 p-8 bg-gray-100 w-max mx-auto', {
          'flex-col': isMobile,
        })}
      >
        <div>
          <small>Your shipment</small>
          <h5 className="font-bold mb-4 uppercase">{code}</h5>
          <small>Estimated Delivery</small>
          <h5 className="text-blue-500 font-bold text-lg">{deliveryEnd}</h5>
          <div className="border-b border-gray-400 my-4" />
          <small className="font-medium">Ship To</small>
          <h5 className="blur-xs select-none">TORONTO, ON CA</h5>
          <h5 className="mt-8">1x Thirty Factor Authentication Key</h5>
          <div className="flex justify-between">
            <small>Express Shipping</small>
            <small className="mono">$39.99</small>
          </div>
          <Image
            src="/thirty-factor-authentication/ups.png"
            alt="ups"
            height={32}
            width={32}
            className="mt-10"
          />
        </div>
        <div className="my-6 ml-3">
          <DeliveryNode title="Label Created" isComplete dateString={deliveryStart} />
          <DeliveryNode
            title="Dropped off at UPS Access Point"
            isComplete
            dateString={deliveryStart}
          />
          <DeliveryNode title="On the Way" isInProgress dateString={deliveryStart} />
          <DeliveryNode title="Out for Delivery" />
          <DeliveryNode title="Delivery" isLast />
        </div>
      </div>
    </>
  )
}

type DeliveryNodeProps = {
  title: string
  dateString?: string
  isInProgress?: boolean
  isComplete?: boolean
  isLast?: boolean
}
const DeliveryNode = ({
  title,
  dateString,
  isInProgress,
  isComplete,
  isLast,
}: DeliveryNodeProps) => {
  return (
    <div
      className={classNames('flex gap-6', {
        '-translate-x-1': !!isInProgress,
      })}
    >
      <div className={classNames('flex flex-col items-center justify-center w-max')}>
        <div
          className={classNames(
            'flex items-center justify-center h-4 w-4 rounded-full bg-green-700',
            {
              '!bg-transparent border-2 border-gray-500': !isComplete && !isInProgress,
              '!bg-transparent border-3 border-green-700 !h-6 !w-6': !!isInProgress,
            }
          )}
        >
          {isComplete && (
            <Image
              src="/thirty-factor-authentication/icons/checkmark.svg"
              alt="checkmark"
              height={12}
              width={12}
            />
          )}
          {isInProgress && (
            <Image
              src="/thirty-factor-authentication/icons/arrow-right.svg"
              alt="checkmark"
              height={14}
              width={14}
            />
          )}
        </div>
        {!isLast && (
          <div
            className={classNames('h-14 border-l-4 border-dotted border-gray-500', {
              '!border-green-700 !border-solid !border-[1.5px]': isComplete,
            })}
          />
        )}
      </div>
      <div className={classNames('flex flex-col', { 'opacity-50': !isInProgress })}>
        <small className="font-bold">{title}</small>
        {(isInProgress || isComplete) && (
          <>
            {isComplete && <small>Canada</small>}
            <small>{dateString}</small>
          </>
        )}
      </div>
    </div>
  )
}

export const UPSControls = ({ handleLevelAdvance, setUPSTrackingTime }: ControlProps) => {
  const timeStartRef = useRef(new Date())
  return (
    <>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary"
        onClick={() => {
          handleLevelAdvance()
          setUPSTrackingTime(addMinutesToDate(timeStartRef.current, 10))
        }}
      >
        Track Your Package
      </button>
    </>
  )
}
