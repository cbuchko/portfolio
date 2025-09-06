import classNames from 'classnames'
import { ScoreProps, StatisticType } from '../side-panel/useScore'
import { ModalContainer } from './ModalContainer'
import { ModalNames } from './modalRegistry'
import { RefObject } from 'react'

const statisticTitles: Record<StatisticType & 'total', string> = {
  [StatisticType.ad]: 'Ad Score',
  [StatisticType.blog]: 'Blog Score',
  [StatisticType.click]: 'Click Score',
  [StatisticType.passive]: 'Passive Score',
  ['total']: 'Total',
}

export const StatisticsModal = ({
  statistic,
  date,
  setActiveModal,
}: {
  statistic: ScoreProps['statistics']
  date: RefObject<Date>
  setActiveModal: (modal?: ModalNames) => void
}) => {
  const totalScore = Object.values(statistic).reduce((acc, curr) => acc + curr, 0)

  const formatElapsedTime = (startDate: Date) => {
    const currentDate = new Date()
    const diffMs = currentDate.getTime() - startDate.getTime() // difference in ms

    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours} Hours ${minutes} Minutes ${seconds} Seconds`
  }

  return (
    <ModalContainer setActiveModal={setActiveModal}>
      <h4 className="text-2xl mb-4">Statistics</h4>
      {Object.entries(statistic).map(([type, amount], idx) => (
        <StatisticRow key={idx} type={type} amount={amount} />
      ))}
      <StatisticRow type={'total'} amount={totalScore} className="mt-4 font-medium" />
      <div className="flex justify-between mt-4">
        <h5>Time Played</h5>
        <h5>{formatElapsedTime(date.current)}</h5>
      </div>
    </ModalContainer>
  )
}

const StatisticRow = ({
  type,
  amount,
  className,
}: {
  amount: number
  type: string
  className?: string
}) => {
  const title = statisticTitles[type as StatisticType & 'total']
  return (
    <div className={classNames('flex justify-between', className)}>
      <h5>{title}</h5>
      <h5>{formatNumber(amount)}</h5>
    </div>
  )
}

const formatNumber = (number: number) => {
  return number.toLocaleString('en-US')
}
