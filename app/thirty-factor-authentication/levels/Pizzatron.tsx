import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import classNames from 'classnames'
import { playSfx, prefetchSound, useSound } from '@/app/utils/useSounds'
import { ContentProps } from './types'
import {
  CHEESE,
  EJECT_MS,
  EXTRAS,
  ExtraId,
  IngredientId,
  MISTAKES_BEFORE_STRIKE,
  PIZZAS_TO_WIN,
  PizzaBuild,
  PizzaRecipe,
  RESULT_FLASH_MS,
  SAUCES,
  SauceId,
  beltMsForServed,
  emptyBuild,
  formatExtraLine,
  getIngredient,
  pickRecipe,
  recipeMatches,
} from '../pizza-constants'

type RoundState = {
  id: number
  recipe: PizzaRecipe
  beltMs: number
}

type Phase = 'idle' | 'running' | 'ejecting' | 'miss'

export const PizzatronContent = ({ handleLevelAdvance, isMobile }: ContentProps) => {
  const [completed, setCompleted] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [round, setRound] = useState<RoundState | null>(null)
  const [build, setBuild] = useState<PizzaBuild>(emptyBuild)
  const [phase, setPhase] = useState<Phase>('idle')
  const [ejectLeftPct, setEjectLeftPct] = useState<number | null>(null)

  const resolvingRef = useRef(false)
  const completedRef = useRef(0)
  const mistakesRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)
  const pizzaWrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const { playSound: playSoundtrack, stopSound: stopSoundtrack } = useSound(
    '/thirty-factor-authentication/sounds/pizzasong.mp3',
    0.2,
    true
  )

  useEffect(() => {
    prefetchSound('/thirty-factor-authentication/sounds/place.mp3')
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      stopSoundtrack()
    }
  }, [stopSoundtrack])

  useEffect(() => {
    if (phase !== 'ejecting' || ejectLeftPct === null) return
    const el = pizzaWrapRef.current
    if (!el) return
    const frame = requestAnimationFrame(() => {
      el.style.left = '110%'
    })
    return () => cancelAnimationFrame(frame)
  }, [phase, ejectLeftPct])

  const schedule = useCallback((fn: () => void, ms: number) => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(fn, ms)
  }, [])

  const beginRound = useCallback((served: number) => {
    setRound((prev) => ({
      id: (prev?.id ?? 0) + 1,
      recipe: pickRecipe(served),
      beltMs: beltMsForServed(served),
    }))
    setBuild(emptyBuild())
    setPhase('running')
    setEjectLeftPct(null)
    resolvingRef.current = false
  }, [])

  const startShift = useCallback(() => {
    completedRef.current = 0
    mistakesRef.current = 0
    setCompleted(0)
    setMistakes(0)
    playSoundtrack()
    beginRound(0)
  }, [beginRound, playSoundtrack])

  const resolveMistake = useCallback(() => {
    if (resolvingRef.current) return
    resolvingRef.current = true
    setPhase('miss')

    const nextMistakes = mistakesRef.current + 1
    mistakesRef.current = nextMistakes
    setMistakes(nextMistakes)

    if (nextMistakes >= MISTAKES_BEFORE_STRIKE) {
      schedule(() => {
        stopSoundtrack()
        handleLevelAdvance()
        setRound(null)
        setBuild(emptyBuild())
        setEjectLeftPct(null)
        setPhase('idle')
        resolvingRef.current = false
      }, RESULT_FLASH_MS)
      return
    }

    schedule(() => beginRound(completedRef.current), RESULT_FLASH_MS)
  }, [beginRound, handleLevelAdvance, schedule, stopSoundtrack])

  const resolveSuccess = useCallback(() => {
    if (resolvingRef.current) return
    resolvingRef.current = true

    const wrap = pizzaWrapRef.current
    const track = trackRef.current
    let startPct = 50
    if (wrap && track) {
      const wrapRect = wrap.getBoundingClientRect()
      const trackRect = track.getBoundingClientRect()
      const center = wrapRect.left + wrapRect.width / 2 - trackRect.left
      startPct = (center / trackRect.width) * 100
    }
    setEjectLeftPct(startPct)
    setPhase('ejecting')

    const next = completedRef.current + 1
    completedRef.current = next
    setCompleted(next)

    const holdMs = Math.max(EJECT_MS, RESULT_FLASH_MS)
    schedule(() => {
      if (next >= PIZZAS_TO_WIN) {
        stopSoundtrack()
        handleLevelAdvance(true)
        return
      }
      beginRound(next)
    }, holdMs)
  }, [beginRound, handleLevelAdvance, schedule, stopSoundtrack])

  const handleBeltEnd = () => {
    if (resolvingRef.current || phase !== 'running') return
    // Only a mistake if the pizza isn't exactly the ticket when it leaves
    if (round && recipeMatches(round.recipe, build)) {
      resolveSuccess()
      return
    }
    resolveMistake()
  }

  const handleIngredient = (id: IngredientId) => {
    if (resolvingRef.current || phase !== 'running') return

    const ingredient = getIngredient(id)
    let nextBuild: PizzaBuild
    if (ingredient.kind === 'sauce') {
      // Replace sauce — wrong sauce is fixable via dump or re-pick
      nextBuild = { ...build, sauce: id as SauceId }
    } else if (ingredient.kind === 'cheese') {
      nextBuild = { ...build, cheese: true }
    } else {
      // Always allow adding — extras beyond the ticket are fixable by dumping
      nextBuild = { ...build, extras: [...build.extras, id as ExtraId] }
    }
    setBuild(nextBuild)
    playSfx('/thirty-factor-authentication/sounds/place.mp3', 0.4)

    if (round && recipeMatches(round.recipe, nextBuild)) {
      requestAnimationFrame(() => resolveSuccess())
    }
  }

  const handleClear = () => {
    if (resolvingRef.current || phase !== 'running') return
    setBuild(emptyBuild())
  }

  const interacting = phase === 'running'
  const awaitingRestart = phase === 'idle' && mistakes >= MISTAKES_BEFORE_STRIKE

  return (
    <div className={classNames({ 'min-w-[580px]': !isMobile })}>
      <p className="text-lg">It&apos;s time for our lunch break. Can you help make the pizzas?</p>
      <div className="pizzatron-scoreboard my-5">
        <div className="pizzatron-score">
          <span className="pizzatron-score-label">Served</span>
          <span className="pizzatron-score-value">
            {completed}
            <span className="pizzatron-score-denom">/{PIZZAS_TO_WIN}</span>
          </span>
        </div>
        <div
          className={classNames('pizzatron-score', {
            'pizzatron-score--warn': mistakes > 0,
            'pizzatron-score--danger': mistakes >= MISTAKES_BEFORE_STRIKE - 1,
          })}
        >
          <span className="pizzatron-score-label">Mistakes</span>
          <span className="pizzatron-score-value">
            {mistakes}
            <span className="pizzatron-score-denom">/{MISTAKES_BEFORE_STRIKE}</span>
          </span>
        </div>
      </div>

      <div
        className={classNames('pizzatron-stage', {
          'pizzatron-stage--mobile': isMobile,
        })}
      >
        <OrderTicket
          blank={phase === 'idle'}
          recipe={round?.recipe}
          orderNumber={round?.id}
          verdict={phase === 'ejecting' ? 'ok' : phase === 'miss' ? 'miss' : null}
        />

        {phase === 'idle' ? (
          <div className="pizzatron-belt pizzatron-belt--idle border border-black rounded-md">
            <button type="button" className="pizzatron-play-button" onClick={startShift}>
              {awaitingRestart ? 'Restart' : 'Play'}
            </button>
          </div>
        ) : (
          round && (
            <div
              className={classNames('pizzatron-belt border border-black rounded-md', {
                'pizzatron-belt--miss': phase === 'miss',
                'pizzatron-belt--eject': phase === 'ejecting',
              })}
            >
              <div ref={trackRef} className="pizzatron-belt-track">
                {phase !== 'miss' && (
                  <div
                    key={round.id}
                    ref={pizzaWrapRef}
                    className={classNames('pizzatron-pizza-wrap', {
                      'pizzatron-pizza-wrap--eject': phase === 'ejecting',
                    })}
                    style={
                      phase === 'ejecting' && ejectLeftPct !== null
                        ? {
                            animation: 'none',
                            left: `${ejectLeftPct}%`,
                            transition: `left ${EJECT_MS}ms linear`,
                          }
                        : { animationDuration: `${round.beltMs}ms` }
                    }
                    onAnimationEnd={handleBeltEnd}
                  >
                    <PizzaVisual build={build} size={isMobile ? 72 : 88} />
                  </div>
                )}
                {phase === 'miss' && (
                  <div className="pizzatron-pizza-wrap pizzatron-pizza-wrap--static">
                    <PizzaVisual build={build} size={isMobile ? 72 : 88} />
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <IngredientStation
        disabled={!interacting}
        onPick={handleIngredient}
        onDump={handleClear}
        canDump={interacting && (build.sauce !== null || build.cheese || build.extras.length > 0)}
        isMobile={isMobile}
      />
    </div>
  )
}

const OrderTicket = ({
  recipe,
  orderNumber,
  verdict,
  blank,
}: {
  recipe?: PizzaRecipe
  orderNumber?: number
  verdict: 'ok' | 'miss' | null
  blank?: boolean
}) => {
  if (blank) {
    return <div className="pizzatron-ticket border border-black" aria-hidden />
  }

  if (!recipe || orderNumber === undefined) return null

  const sauce = getIngredient(recipe.sauce)
  const extraLines = (Object.entries(recipe.extras) as [ExtraId, number][])
    .filter(([, count]) => count > 0)
    .map(([id, count]) => formatExtraLine(id, count))

  return (
    <div
      className={classNames('pizzatron-ticket border border-black', {
        'pizzatron-ticket--ok': verdict === 'ok',
        'pizzatron-ticket--miss': verdict === 'miss',
      })}
    >
      {verdict ? (
        <div className="pizzatron-ticket-verdict" aria-live="polite">
          <span className="pizzatron-ticket-verdict-mark">{verdict === 'ok' ? '✓' : '✕'}</span>
        </div>
      ) : (
        <>
          <div className="pizzatron-ticket-header">
            <span className="pizzatron-ticket-brand">ORDER</span>
            <span className="pizzatron-ticket-number">#{String(orderNumber).padStart(3, '0')}</span>
          </div>
          <div className="pizzatron-ticket-divider" />
          <ul className="pizzatron-ticket-lines">
            <li>{sauce.label}</li>
            {recipe.cheese && <li>{CHEESE.label}</li>}
            {extraLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

const IngredientStation = ({
  disabled,
  onPick,
  onDump,
  canDump,
  isMobile,
}: {
  disabled: boolean
  onPick: (id: IngredientId) => void
  onDump: () => void
  canDump: boolean
  isMobile?: boolean
}) => {
  return (
    <div className={classNames('pizzatron-station mt-3', { 'pizzatron-station--mobile': isMobile })}>
      <IngredientGroup label="Sauce">
        {SAUCES.map((ing) => (
          <button
            key={ing.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(ing.id)}
            className="pizzatron-ingredient pizzatron-ingredient--sauce border border-black"
            title={ing.label}
          >
            <span className="pizzatron-sauce-bottle" style={{ ['--sauce' as string]: ing.color }} />
            <span className="pizzatron-ingredient-label">{ing.label}</span>
          </button>
        ))}
      </IngredientGroup>

      <IngredientGroup label="Cheese">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPick(CHEESE.id)}
          className="pizzatron-ingredient pizzatron-ingredient--cheese border border-black"
          title={CHEESE.label}
        >
          <span className="pizzatron-cheese-pile" />
          <span className="pizzatron-ingredient-label">{CHEESE.label}</span>
        </button>
      </IngredientGroup>

      <div className="pizzatron-group">
        <p className="pizzatron-group-label">Toppings</p>
        <div className="pizzatron-toppings-row">
          <div className="flex flex-wrap gap-1.5">
            {EXTRAS.map((ing) => (
              <button
                key={ing.id}
                type="button"
                disabled={disabled}
                onClick={() => onPick(ing.id)}
                className="pizzatron-ingredient pizzatron-ingredient--extra border border-black"
                title={`${ing.label} (tap each)`}
              >
                <span
                  className={classNames('pizzatron-extra-bit', `pizzatron-extra-bit--${ing.id}`)}
                  style={{ background: ing.color }}
                />
                <span className="pizzatron-ingredient-label">{ing.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pizzatron-dump border border-black"
            onClick={onDump}
            disabled={!canDump}
            title="Dump pizza"
          >
            Dump
          </button>
        </div>
      </div>
    </div>
  )
}

const IngredientGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="pizzatron-group">
    <p className="pizzatron-group-label">{label}</p>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
)

const PizzaVisual = ({ build, size }: { build: PizzaBuild; size: number }) => {
  return (
    <div
      className="pizzatron-pizza relative rounded-full border border-black"
      style={{ width: size, height: size, background: '#e8c39e' }}
      aria-hidden
    >
      {build.sauce && (
        <div
          className="absolute inset-[12%] rounded-full"
          style={{ background: getIngredient(build.sauce).color, opacity: 0.92 }}
        />
      )}
      {build.cheese && (
        <div
          className="absolute inset-[18%] rounded-full"
          style={{ background: CHEESE.color, opacity: 0.88 }}
        />
      )}
      {build.extras.map((t, i) => {
        const angle = (i * 2.4 + 0.5) % (Math.PI * 2)
        const r = size * (0.16 + (i % 3) * 0.04)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        const bit = getIngredient(t)
        return (
          <div
            key={`${t}-${i}`}
            className={classNames('absolute border border-black/25', {
              'rounded-full': t === 'pepperoni' || t === 'olive',
              'rounded-sm': t === 'mushroom' || t === 'pineapple',
            })}
            style={{
              width: size * (t === 'pepperoni' ? 0.14 : 0.12),
              height: size * (t === 'pepperoni' ? 0.14 : 0.1),
              background: bit.color,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          />
        )
      })}
    </div>
  )
}
