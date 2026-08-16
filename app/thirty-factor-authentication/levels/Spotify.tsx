import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useSound } from '@/app/utils/useSounds'
import { ContentProps, ControlProps } from './types'

type Position = { x: number; y: number }

type ChartNote = {
  id: number
  hitTimeMs: number
  approachMs: number
  color: string
  comboIndex: number
  x: number
  y: number
}

type ActiveNote = ChartNote & {
  judgment: Judgment | null
  resolvedAtMs: number | null
}

type FloatingJudgment = {
  id: number
  judgment: Judgment
  x: number
  y: number
  createdAt: number
}

enum Judgment {
  miss = 'MISS',
  ok = 'OK',
  good = 'GOOD',
  great = 'GREAT',
}

const colorHexArray = ['#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#9ca3af']
const fullTimeQuarter = 375
const halfTimeQuarter = 750

const greatScore = 200
const goodScore = 100
const okScore = 50

// Match original pad lifetime: miss only after hitTime + lateGraceMs.
// Click scoring mirrors the old elapsed windows (early tap = OK, near ring close = GREAT).
const lateGraceMs = 100
const greatEarlyMs = 75
// Negative = hit times earlier vs audio — compensates for feeling late-to-GREAT
const chartOffsetMs = -70
const judgmentLingerMs = 450
const desktopPadSize = 100
const mobilePadSize = 96

const cadences = [
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[0] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[1] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[2] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[3] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[4] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[5] },
  { count: 4, delay: halfTimeQuarter, color: colorHexArray[0] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[1] },
  { count: 1, delay: fullTimeQuarter, color: colorHexArray[2] },
  { count: 1, delay: fullTimeQuarter, color: colorHexArray[3] },
  { count: 1, delay: fullTimeQuarter, color: colorHexArray[4] },
  { count: 1, delay: fullTimeQuarter, color: colorHexArray[5] },
  { count: 1, delay: fullTimeQuarter, color: colorHexArray[0] },
  { count: 1, delay: fullTimeQuarter, color: colorHexArray[1] },
  { count: 15, delay: fullTimeQuarter, color: colorHexArray[2] },
  { count: 15, delay: fullTimeQuarter, color: colorHexArray[3] },
  { count: 15, delay: fullTimeQuarter, color: colorHexArray[4] },
  { count: 15, delay: fullTimeQuarter, color: colorHexArray[5] },
  { count: 15, delay: fullTimeQuarter, color: colorHexArray[0] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[1] },
  { count: 7, delay: halfTimeQuarter, color: colorHexArray[2] },
]

const getPlayfieldBounds = (padSize: number, isMobile: boolean) => {
  const vw = window.visualViewport?.width ?? window.innerWidth
  const vh = window.visualViewport?.height ?? window.innerHeight
  const top = vh * 0.52
  const bottom = Math.max(top + padSize, vh - padSize - (isMobile ? 16 : 28))
  const marginX = isMobile ? 10 : Math.max(24, (vw - 520) / 2)
  const left = marginX
  const right = Math.max(left + padSize, vw - padSize - marginX)
  return { top, bottom, left, right }
}

const clampToPlayfield = (x: number, y: number, padSize: number, isMobile: boolean): Position => {
  const { top, bottom, left, right } = getPlayfieldBounds(padSize, isMobile)
  return {
    x: Math.min(right, Math.max(left, x)),
    y: Math.min(bottom, Math.max(top, y)),
  }
}

const getRandomPosition = (
  previousPosition: Position | null,
  padSize: number,
  isMobile: boolean,
  callstackCount = 0
): Position => {
  const { top, bottom, left, right } = getPlayfieldBounds(padSize, isMobile)
  const x = Math.random() * (right - left) + left
  const y = Math.random() * (bottom - top) + top
  const position = clampToPlayfield(x, y, padSize, isMobile)

  if (callstackCount > 5) return position

  if (
    previousPosition &&
    position.x >= previousPosition.x - padSize * 2 &&
    position.x <= previousPosition.x + padSize * 2 &&
    position.y >= previousPosition.y - padSize * 2 &&
    position.y <= previousPosition.y + padSize * 2
  ) {
    return getRandomPosition(previousPosition, padSize, isMobile, callstackCount + 1)
  }
  return position
}

const getRelativePosition = (
  position: Position,
  secondaryPrevious: Position | null,
  padSize: number,
  isMobile: boolean
): Position => {
  const { top, bottom, left, right } = getPlayfieldBounds(padSize, isMobile)
  const magnitude = Math.max(56, padSize * 0.75)
  const edgeZone = Math.max(padSize * 1.15, 72)

  const nearLeft = position.x - left < edgeZone
  const nearRight = right - position.x < edgeZone
  const nearTop = position.y - top < edgeZone
  const nearBottom = bottom - position.y < edgeZone

  // Always stay one combo-step away — never teleport mid-chain
  const xOptions = nearLeft ? [magnitude] : nearRight ? [-magnitude] : [magnitude, -magnitude]
  const yOptions = nearTop ? [magnitude] : nearBottom ? [-magnitude] : [magnitude, -magnitude]

  const candidates: Position[] = []
  for (const dx of xOptions) {
    for (const dy of yOptions) {
      candidates.push(clampToPlayfield(position.x + dx, position.y + dy, padSize, isMobile))
    }
  }

  // Shuffle so mid-playfield chains still feel random among valid neighbors
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const notDoubleBack = candidates.find(
    (c) =>
      !secondaryPrevious || c.x !== secondaryPrevious.x || c.y !== secondaryPrevious.y
  )
  return notDoubleBack ?? candidates[0]
}

const buildChart = (padSize: number, isMobile: boolean): ChartNote[] => {
  const notes: ChartNote[] = []
  let hitTimeMs = chartOffsetMs
  let previous: Position | null = null
  let secondary: Position | null = null
  let id = 0

  for (const cadence of cadences) {
    for (let i = 0; i < cadence.count; i++) {
      hitTimeMs += cadence.delay
      const insideCadence: boolean = i > 0 && previous !== null
      const position: Position = insideCadence
        ? getRelativePosition(previous!, secondary, padSize, isMobile)
        : getRandomPosition(previous, padSize, isMobile)
      secondary = previous
      previous = position
      notes.push({
        id: id++,
        hitTimeMs,
        approachMs: cadence.delay,
        color: cadence.color,
        comboIndex: i + 1,
        x: position.x,
        y: position.y,
      })
    }
  }

  return notes
}

const scoreForJudgment = (judgment: Judgment) => {
  if (judgment === Judgment.great) return greatScore
  if (judgment === Judgment.good) return goodScore
  if (judgment === Judgment.ok) return okScore
  return 0
}

/** Original feel: delta = now - hitTimeMs (negative = early). Any live press scores at least OK. */
const judgmentFromTiming = (deltaMs: number, approachMs: number): Judgment => {
  if (deltaMs >= -greatEarlyMs) return Judgment.great
  if (deltaMs >= -approachMs / 3) return Judgment.good
  return Judgment.ok
}

const formatTrackTime = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const noteCountFromCadences = cadences.reduce((acc, c) => acc + c.count, 0)

const chartEndMsFromCadences = (() => {
  let hitTimeMs = chartOffsetMs
  for (const cadence of cadences) {
    for (let i = 0; i < cadence.count; i++) hitTimeMs += cadence.delay
  }
  return hitTimeMs + lateGraceMs
})()

export const SpotifyContent = ({ handleLevelAdvance, isMobile }: ContentProps) => {
  const padSize = isMobile ? mobilePadSize : desktopPadSize
  const [chart, setChart] = useState<ChartNote[]>([])
  const noteCount = noteCountFromCadences

  const scoreThreshold = useMemo(() => {
    return Math.floor(noteCount * 0.6 * greatScore + noteCount * 0.4 * goodScore)
  }, [noteCount])

  const {
    playSound: playSoundtrack,
    stopSound: stopSoundtrack,
    getCurrentTimeMs,
    audioRef,
  } = useSound('/thirty-factor-authentication/sounds/open-the-sky.wav', 0.3, false)

  const chartEndMs = chartEndMsFromCadences
  const clickPoolRef = useRef<HTMLAudioElement[]>([])
  const clickPoolIndexRef = useRef(0)

  useEffect(() => {
    clickPoolRef.current = [0, 1, 2].map(() => {
      const audio = new Audio('/thirty-factor-authentication/sounds/osu-click.mp3')
      audio.preload = 'auto'
      audio.volume = 0.25
      return audio
    })
    return () => {
      clickPoolRef.current.forEach((audio) => {
        audio.pause()
      })
      clickPoolRef.current = []
    }
  }, [])

  const playClickSound = useCallback(() => {
    const pool = clickPoolRef.current
    if (!pool.length) return
    const audio = pool[clickPoolIndexRef.current % pool.length]
    clickPoolIndexRef.current += 1
    audio.currentTime = 0
    void audio.play()
  }, [])

  const [isStarted, setIsStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [failMessage, setFailMessage] = useState<string | null>(null)
  const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
  const [judgments, setJudgments] = useState<FloatingJudgment[]>([])
  const [progress, setProgress] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [trailPoints, setTrailPoints] = useState<Position[]>([])

  const nextSpawnIndexRef = useRef(0)
  const activeNotesRef = useRef<ActiveNote[]>([])
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const finishedRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const chartRef = useRef(chart)
  chartRef.current = chart

  const pushJudgment = useCallback((note: ChartNote, judgment: Judgment) => {
    setJudgments((prev) => [
      ...prev,
      {
        id: note.id,
        judgment,
        x: note.x + padSize / 2,
        y: note.y + padSize / 2,
        createdAt: performance.now(),
      },
    ])
  }, [padSize])

  const registerJudgment = useCallback((judgment: Judgment) => {
    if (judgment === Judgment.miss) {
      comboRef.current = 0
    } else {
      comboRef.current += 1
    }
    setCombo(comboRef.current)
  }, [])

  const finishGame = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    stopSoundtrack()
    const hasWon = scoreRef.current >= scoreThreshold
    if (hasWon) {
      handleLevelAdvance(true)
      return
    }
    // Strike + stay on level (AuthContainer adds the X when skipVerify is omitted)
    handleLevelAdvance()
    finishedRef.current = false
    nextSpawnIndexRef.current = 0
    setIsStarted(false)
    setActiveNotes([])
    activeNotesRef.current = []
    setJudgments([])
    setProgress(0)
    setElapsedMs(0)
    setTrailPoints([])
    setCombo(0)
    comboRef.current = 0
    setFailMessage('Not enough listening activity. Try again.')
  }, [handleLevelAdvance, scoreThreshold, stopSoundtrack])

  const resolveNote = useCallback(
    (noteId: number, judgment: Judgment, nowMs: number) => {
      const notes = activeNotesRef.current
      const index = notes.findIndex((n) => n.id === noteId)
      if (index === -1) return
      const note = notes[index]
      if (note.judgment) return

      const points = scoreForJudgment(judgment)
      scoreRef.current += points
      setScore(scoreRef.current)
      registerJudgment(judgment)
      pushJudgment(note, judgment)

      const updated = [...notes]
      updated[index] = { ...note, judgment, resolvedAtMs: nowMs }
      activeNotesRef.current = updated
      setActiveNotes(updated)
    },
    [pushJudgment, registerJudgment]
  )

  const handleNotePress = useCallback(
    (noteId: number) => {
      const nowMs = getCurrentTimeMs()
      const note = activeNotesRef.current.find((n) => n.id === noteId)
      if (!note || note.judgment) return
      playClickSound()
      const judgment = judgmentFromTiming(nowMs - note.hitTimeMs, note.approachMs)
      resolveNote(noteId, judgment, nowMs)
    },
    [getCurrentTimeMs, playClickSound, resolveNote]
  )

  // Score tick-up animation
  useEffect(() => {
    if (displayScore === score) return
    let raf = 0
    let current = displayScore
    const step = () => {
      const diff = score - current
      if (Math.abs(diff) <= 1) {
        setDisplayScore(score)
        return
      }
      current = current + Math.ceil(diff * 0.2)
      if ((diff > 0 && current > score) || (diff < 0 && current < score)) current = score
      setDisplayScore(current)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // Only re-run when target score changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score])

  // Desktop cursor trail — listen on window so it works across the full playfield
  useEffect(() => {
    if (isMobile || !isStarted) return
    const onMove = (e: PointerEvent) => {
      setTrailPoints((prev) => {
        const next = [...prev, { x: e.clientX, y: e.clientY }]
        return next.slice(-14)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [isMobile, isStarted])

  // Main audio-clock game loop
  useEffect(() => {
    if (!isStarted) return
    finishedRef.current = false

    const tick = () => {
      const audio = audioRef.current
      const nowMs = (audio?.currentTime ?? 0) * 1000
      // Chart-relative progress — audio.duration can be flaky mid-decode on some browsers
      setProgress(Math.min(1, nowMs / chartEndMs))
      setElapsedMs(Math.min(nowMs, chartEndMs))

      const chartNotes = chartRef.current
      let notes = activeNotesRef.current
      let changed = false

      while (nextSpawnIndexRef.current < chartNotes.length) {
        const next = chartNotes[nextSpawnIndexRef.current]
        if (nowMs < next.hitTimeMs - next.approachMs) break
        notes = [
          ...notes,
          {
            ...next,
            judgment: null,
            resolvedAtMs: null,
          },
        ]
        nextSpawnIndexRef.current += 1
        changed = true
      }

      notes = notes.map((note) => {
        if (note.judgment) return note
        if (nowMs > note.hitTimeMs + lateGraceMs) {
          changed = true
          registerJudgment(Judgment.miss)
          pushJudgment(note, Judgment.miss)
          return { ...note, judgment: Judgment.miss, resolvedAtMs: nowMs }
        }
        return note
      })

      const kept = notes.filter((note) => {
        if (!note.judgment || note.resolvedAtMs === null) return true
        return nowMs - note.resolvedAtMs < judgmentLingerMs
      })
      if (kept.length !== notes.length) changed = true
      notes = kept

      if (changed) {
        activeNotesRef.current = notes
        setActiveNotes(notes)
      }

      setJudgments((prev) => {
        const wallNow = performance.now()
        const next = prev.filter((j) => wallNow - j.createdAt < judgmentLingerMs + 100)
        return next.length === prev.length ? prev : next
      })

      const allSpawned = nextSpawnIndexRef.current >= chartNotes.length
      const pastLastHit =
        chartNotes.length > 0 &&
        nowMs > chartNotes[chartNotes.length - 1].hitTimeMs + lateGraceMs + judgmentLingerMs

      // Don't end on noneActive alone — brief gaps between notes are normal
      if (allSpawned && pastLastHit) {
        finishGame()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [isStarted, finishGame, audioRef, chartEndMs, pushJudgment, registerJudgment])

  const handleStart = () => {
    const nextChart = buildChart(padSize, !!isMobile)
    chartRef.current = nextChart
    setChart(nextChart)
    nextSpawnIndexRef.current = 0
    activeNotesRef.current = []
    scoreRef.current = 0
    comboRef.current = 0
    finishedRef.current = false
    setActiveNotes([])
    setJudgments([])
    setScore(0)
    setDisplayScore(0)
    setCombo(0)
    setFailMessage(null)
    setProgress(0)
    setElapsedMs(0)
    setTrailPoints([])
    setIsStarted(true)
    playSoundtrack()
  }

  const liveNotes = activeNotes.filter((n) => !n.judgment)

  return (
    <div className="spotify-level">
      <p className="text-lg">Verify listening activity</p>
      <p className="text-sm text-gray-600 mb-3">
        Keep the beat to your most listened to song. Score at least {scoreThreshold} to pass.
      </p>

      <div className="spotify-chrome rounded-xl border border-[#282828] bg-[#121212] text-white p-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden bg-[#191414]">
            <img
              src="/thirty-factor-authentication/kxdama.jpg"
              alt="Kxdama"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          <div className="min-w-0 grow">
            <div className="text-sm font-semibold truncate">Open the Sky</div>
            <div className="text-xs text-[#b3b3b3] truncate">Kxdama</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="shrink-0 text-[11px] tabular-nums text-[#b3b3b3]">
                {formatTrackTime(elapsedMs)}
              </span>
              <div className="h-1 min-w-0 grow rounded-full bg-[#404040] overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-[#b3b3b3]">
                {formatTrackTime(chartEndMs)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={classNames(
              'shrink-0 rounded-full bg-white text-black font-semibold px-4 py-2 text-sm cursor-pointer hover:scale-105 transition-transform',
              { 'opacity-0 pointer-events-none': isStarted }
            )}
            onClick={handleStart}
          >
            {score > 0 || failMessage ? 'Retry' : 'Play'}
          </button>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <div className="font-mono text-2xl tabular-nums">{displayScore}</div>
            <div
              className={classNames(
                'font-mono text-lg tabular-nums text-[#1db954] transition-opacity',
                { 'opacity-0': combo < 2 }
              )}
            >
              ×{combo}
            </div>
          </div>
          <div className="text-xs text-[#b3b3b3]">Target {scoreThreshold}</div>
        </div>
      </div>

      {failMessage && (
        <p className="mt-2 text-sm text-red-600 font-medium">{failMessage}</p>
      )}

      {!isMobile &&
        trailPoints.map((point, idx) => (
          <div
            key={`trail-${idx}`}
            className="pointer-events-none fixed z-[120] rounded-full bg-[#1db954]"
            style={{
              left: point.x,
              top: point.y,
              width: 6 + idx * 0.4,
              height: 6 + idx * 0.4,
              opacity: (idx + 1) / trailPoints.length / 2,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

      {liveNotes.map((note) => (
        <RhythmPad key={note.id} note={note} padSize={padSize} onPress={handleNotePress} />
      ))}

      {judgments.map((j) => (
        <div
          key={`judge-${j.id}-${j.createdAt}`}
          className={classNames(
            'fixed z-[130] pointer-events-none font-bold text-3xl tracking-wide spotify-judgment',
            {
              'text-[#4ade80]': j.judgment === Judgment.great,
              'text-[#60a5fa]': j.judgment === Judgment.good,
              'text-[#facc15]': j.judgment === Judgment.ok,
              'text-[#f87171]': j.judgment === Judgment.miss,
            }
          )}
          style={{ left: j.x, top: j.y }}
        >
          {j.judgment}
        </div>
      ))}
    </div>
  )
}

const RhythmPad = ({
  note,
  padSize,
  onPress,
}: {
  note: ActiveNote
  padSize: number
  onPress: (id: number) => void
}) => {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPress(note.id)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        left: note.x,
        top: note.y,
        width: padSize,
        height: padSize,
        backgroundColor: note.color,
        ['--approach-ms' as string]: `${note.approachMs}ms`,
      }}
      className="fixed border-[5px] border-black flex items-center justify-center rounded-full cursor-pointer z-[100] select-none touch-none spotify-pad"
    >
      <div
        className="spotify-approach-ring pointer-events-none absolute inset-0 rounded-full border-4"
        style={{ borderColor: note.color }}
      />
      <p className="mono text-3xl text-white select-none pointer-events-none relative z-10">
        {note.comboIndex}
      </p>
    </div>
  )
}

export const SpotifyControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
