import Image from 'next/image'
import { useEffect, useState } from 'react'
import { upsDeliveryTimeKey, upsKey } from '../constants'
import { getFormattedDate } from '../utils'

type UPSTrackerProps = {}

export const UPSTracker = ({}: UPSTrackerProps) => {
  const [code, setCode] = useState('')
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const code = localStorage.getItem(upsKey)
    const time = localStorage.getItem(upsDeliveryTimeKey)
    if (!time || !code) return
    setCode(code)
    setTimeString(getFormattedDate(new Date(parseInt(time))))
  }, [])

  if (!code || !timeString) return null
  return (
    <div className="fixed right-0 bottom-0 rounded-lg m-8 z-1000 shadow-lg">
      <div className="absolute rounded-t-md px-2 pb-2 bg-red-400 w-full -z-1 -translate-y-[80%]">
        <small className="font-medium">Your package has been delayed</small>
      </div>
      <div className="flex items-center gap-2 bg-[#FFBE00] p-2 rounded-t-md">
        <div className="bg-white rounded-lg p-1">
          <Image src="/thirty-factor-authentication/ups.png" alt="ups" height={24} width={24} />
        </div>
        <h5 className="font-medium ">Package Tracker</h5>
      </div>
      <div className="p-3 flex flex-col">
        <small className="mb-2">
          Your package is <span className="font-bold">On the Way.</span>
        </small>
        <small>
          Tracking Id: <span className="uppercase">{code}</span>
        </small>
        <small>Estimated Delivery: {timeString}</small>
      </div>
    </div>
  )
}
