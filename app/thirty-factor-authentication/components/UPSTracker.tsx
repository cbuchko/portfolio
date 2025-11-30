import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { addMinutesToDate, getFormattedDate } from '../utils'
import classNames from 'classnames'
import { useSound } from '@/app/utils/useSounds'

type UPSTrackerProps = { code: string; time: number }

const firstDelay = 1000 * 30
const secondDelay = 1000 * 60 * 2
const thirdDelay = 1000 * 60 * 4
const fourthDelay = 1000 * 60 * 8
const fifthDelay = 1000 * 60 * 12
const sixthDelay = 1000 * 60 * 15

export const UPSTracker = ({ code, time }: UPSTrackerProps) => {
  const [timeString, setTimeString] = useState(getFormattedDate(time))
  const [message, setMessage] = useState('Your package is On the Way.')
  const [isError, setIsError] = useState(false)
  const baseTimeRef = useRef<number>(time)
  const playUPSError = useSound('/thirty-factor-authentication/sounds/notification.mp3')

  //change the tracker, surface the error, play the notification
  const handleDelay = useCallback(
    (message: string, delayMinutes: number) => {
      const newDate = addMinutesToDate(baseTimeRef.current, delayMinutes)
      setTimeString(getFormattedDate(newDate))
      setMessage(message)
      baseTimeRef.current = newDate
      setIsError(true)
      setTimeout(() => setIsError(false), 5000)
      playUPSError()
    },
    [playUPSError]
  )

  useEffect(() => {
    //setup all the delays that will happen
    const firstTimeout = setTimeout(() => {
      handleDelay('Your package has been delayed due to a sorting error.', 5)
    }, firstDelay)
    const secondTimeout = setTimeout(() => {
      handleDelay(
        'We thought your package was trash so we discarded it. A new one will be sent your way.',
        5
      )
    }, secondDelay)
    const thirdTimeout = setTimeout(() => {
      handleDelay(
        'Your package is Out for Delivery. Your courier has fifty deliveries on the way.',
        5
      )
    }, thirdDelay)
    const fourthTimeout = setTimeout(() => {
      handleDelay(
        'Due to the beautiful weather today, your courier has opted to take the day off. A new courier will be found.',
        30
      )
    }, fourthDelay)
    const fifthTimeout = setTimeout(() => {
      handleDelay(
        "Sorry we haven't gotten your package to you yet. We kind of thought you didn't want it? Are you sure you want this package delivered to you? Just double checking. You do? Ok weirdo.",
        60
      )
    }, fifthDelay)
    const sixthTimeout = setTimeout(() => {
      handleDelay(
        "Honestly delivering the package is kind of killing the vibe here, so we're just gonna take our time on this one. There's probably nothing important inside.",
        60 * 24 * 100
      )
    }, sixthDelay)

    return () => {
      clearTimeout(firstTimeout)
      clearTimeout(secondTimeout)
      clearTimeout(thirdTimeout)
      clearTimeout(fourthTimeout)
      clearTimeout(fifthTimeout)
      clearTimeout(sixthTimeout)
    }
  }, [])

  if (!code || !time) return null
  return (
    <div
      className={classNames(
        'fixed right-0 bottom-0 rounded-lg m-8 z-1000 shadow-lg max-w-[310px]',
        { 'notification-wiggle': isError }
      )}
    >
      <div
        className={classNames(
          'absolute rounded-t-md px-2 pb-2 bg-red-400 w-full -z-1 transition-transform duration-1000',
          {
            '-translate-y-[80%]': isError,
          }
        )}
      >
        <small className="font-medium">Your package has been delayed :(</small>
      </div>
      <div className="flex items-center gap-2 bg-[#FFBE00] p-2 rounded-t-md">
        <div className="bg-white rounded-lg p-1">
          <Image src="/thirty-factor-authentication/ups.png" alt="ups" height={24} width={24} />
        </div>
        <h5 className="font-medium ">Package Tracker</h5>
      </div>
      <div className="p-3 flex flex-col bg-white rounded-b-md">
        <DefaultContent message={message} code={code} timeString={timeString} />
      </div>
    </div>
  )
}

type ContentProps = {
  message: string
  code: string
  timeString: string
}

const DefaultContent = ({ message, code, timeString }: ContentProps) => {
  return (
    <>
      <small className="mb-2">{message}</small>
      <small>
        Tracking Id: <span className="uppercase">{code}</span>
      </small>
      <small>Estimated Delivery: {timeString}</small>
    </>
  )
}
