import { LevelTiming } from '../levels/useLevel'
import { formatDurationMs } from '../utils'

export const RunStats = ({
  levelTimings,
  accent = 'neutral',
}: {
  levelTimings: LevelTiming[]
  accent?: 'neutral' | 'victory' | 'defeat'
}) => {
  if (levelTimings.length === 0) return null

  const totalMs = levelTimings.reduce((sum, entry) => sum + entry.durationMs, 0)
  const borderClass =
    accent === 'victory'
      ? 'border-green-300'
      : accent === 'defeat'
        ? 'border-red-300'
        : 'border-gray-300'

  return (
    <div className={`mt-4 border rounded-md ${borderClass} bg-white/60 overflow-hidden`}>
      <div className="flex justify-between items-baseline px-3 py-2 border-b border-inherit text-sm font-semibold">
        <span>Session log</span>
        <span className="tabular-nums font-mono text-xs font-normal">
          Total {formatDurationMs(totalMs)}
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
            <span className="shrink-0 font-mono text-xs text-gray-700">
              {formatDurationMs(entry.durationMs)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
