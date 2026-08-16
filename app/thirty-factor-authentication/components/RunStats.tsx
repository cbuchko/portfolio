import { LevelTiming } from '../levels/useLevel'
import { formatDurationMs } from '../utils'
import Image from 'next/image'
import classNames from 'classnames'

const maxStrikes = 3

const StrikeSlots = ({ strikes }: { strikes: number }) => {
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0" aria-label={`${strikes} of ${maxStrikes} strikes`}>
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
      <div className="flex justify-between items-baseline px-3 py-2 border-b border-inherit text-sm font-semibold gap-3">
        <span>Session log</span>
        <span className="tabular-nums font-mono text-xs font-normal flex items-center gap-3">
          <span className="text-gray-600">
            {totalStrikes} strike{totalStrikes === 1 ? '' : 's'}
          </span>
          <span>Total {formatDurationMs(totalMs)}</span>
        </span>
      </div>
      <ul className="max-h-80 overflow-y-auto text-sm divide-y divide-gray-200 overscroll-contain">
        {levelTimings.map((entry) => (
          <li
            key={entry.level}
            className="flex h-8 items-center justify-between gap-3 px-3 tabular-nums"
          >
            <span className="min-w-0 truncate">
              <span className="text-gray-500 mr-1">{entry.level}.</span>
              {entry.title}
            </span>
            <span className="shrink-0 flex items-center gap-2">
              <StrikeSlots strikes={entry.strikes ?? 0} />
              <span className="font-mono text-xs text-gray-700 w-14 text-right">
                {formatDurationMs(entry.durationMs)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
