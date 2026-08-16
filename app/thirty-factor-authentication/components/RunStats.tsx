import { LevelTiming } from '../levels/useLevel'
import { formatDurationMs } from '../utils'
import Image from 'next/image'
import classNames from 'classnames'

const maxStrikes = 3

const StrikeSlots = ({ strikes }: { strikes: number }) => {
  return (
    <span
      className="inline-flex w-full items-center justify-end gap-0.5"
      aria-label={`${strikes} of ${maxStrikes} strikes`}
    >
      {Array.from({ length: maxStrikes }).map((_, idx) => {
        const filled = idx < strikes
        return (
          <Image
            key={idx}
            src={
              filled
                ? '/thirty-factor-authentication/icons/red-x.svg'
                : '/thirty-factor-authentication/icons/x.svg'
            }
            alt=""
            width={14}
            height={14}
            className={classNames({ 'opacity-20': !filled })}
          />
        )
      })}
    </span>
  )
}

const rowClass =
  'grid grid-cols-[minmax(0,1fr)_5.5rem_5.75rem] items-center gap-2 px-3'

export const RunStats = ({
  levelTimings,
  accent = 'neutral',
}: {
  levelTimings: LevelTiming[]
  accent?: 'neutral' | 'victory' | 'defeat'
}) => {
  if (levelTimings.length === 0) return null

  const totalMs = levelTimings.reduce((sum, entry) => sum + entry.durationMs, 0)
  const totalStrikes = levelTimings.reduce((sum, entry) => sum + (entry.strikes ?? 0), 0)
  const borderClass =
    accent === 'victory'
      ? 'border-green-300'
      : accent === 'defeat'
        ? 'border-red-300'
        : 'border-gray-300'

  return (
    <div className={`mt-4 border rounded-md ${borderClass} bg-white/60 overflow-hidden`}>
      <div
        className={`${rowClass} py-2 border-b border-inherit text-sm font-semibold`}
      >
        <span>Session log</span>
        <span className="tabular-nums font-mono text-xs font-normal text-gray-600 text-right whitespace-nowrap">
          {totalStrikes} strike{totalStrikes === 1 ? '' : 's'}
        </span>
        <span className="tabular-nums font-mono text-xs font-normal text-right">
          Total {formatDurationMs(totalMs)}
        </span>
      </div>
      <ul className="max-h-80 overflow-y-auto text-sm divide-y divide-gray-200 overscroll-contain">
        {levelTimings.map((entry) => (
          <li key={entry.level} className={`${rowClass} h-8 tabular-nums`}>
            <span className="min-w-0 truncate">
              <span className="text-gray-500 mr-1">{entry.level}.</span>
              {entry.title}
            </span>
            <StrikeSlots strikes={entry.strikes ?? 0} />
            <span className="font-mono text-xs text-gray-700 text-right">
              {formatDurationMs(entry.durationMs)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
