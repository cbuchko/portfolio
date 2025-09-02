import { useState } from 'react'

export type BlogViewProps = {
  viewFrequencyInMs: number
  viewOdds: number
  viewScoreGain: number
}

export const useBlogViews = () => {
  const [viewFrequencyInMs, setViewFrequency] = useState(5000)
  const [viewOdds, setViewOdds] = useState(10) //10 = 1/10, 5 = 1/5, etc.
  const [viewScoreGain, setViewScoreGain] = useState(1)

  return { viewFrequencyInMs, viewOdds, viewScoreGain } as BlogViewProps
}
