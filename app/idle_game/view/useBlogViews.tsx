import { useState } from 'react'

export type BlogViewProps = {
  viewFrequencyInMs: number
  viewOdds: number
  viewGain: number
  setViewFrequency: (frequency: number) => void
  setViewOdds: (odds: number) => void
  setViewGain: (gain: number) => void
}

export const useBlogViews = () => {
  const [viewFrequencyInMs, setViewFrequency] = useState(5000)
  const [viewOdds, setViewOdds] = useState(10) //10 = 1/10, 5 = 1/5, etc.
  const [viewGain, setViewGain] = useState(1)

  return {
    viewFrequencyInMs,
    viewOdds,
    viewGain,
    setViewFrequency,
    setViewOdds,
    setViewGain,
  } as BlogViewProps
}
