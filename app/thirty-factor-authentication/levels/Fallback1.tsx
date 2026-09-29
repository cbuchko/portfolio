import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { ContentProps, ControlProps } from './types'
import { fallbackPassKey } from '../constants'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { setTfaAttemptContext } from '../analytics'

const PASSWORD_ATTEMPT_MAX = 80

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const monthRe = new RegExp(`(${MONTHS.join('|')})`, 'i')
const consecutiveConsonantsRe = /[B-DF-HJ-NP-TV-XZ]{2}/i

type PasswordRules = {
  length: boolean
  uppercase: boolean
  symbols: boolean
  consonants: boolean
  month: boolean
}

const RULES: { key: keyof PasswordRules; label: string }[] = [
  { key: 'length', label: 'Your password must be at least 6 characters.' },
  { key: 'uppercase', label: 'Your password must contain exactly four uppercase letters.' },
  { key: 'symbols', label: 'Your password must contain as many symbols as vowels.' },
  { key: 'month', label: 'Your password must include a month of the year.' },
  { key: 'consonants', label: 'Your password must not contain two consonants in a row.' },
]

const evaluatePassword = (input: string): PasswordRules => {
  const vowelCount = (input.match(/[aeiouy]/gi) || []).length
  const symbolCount = (input.match(/[^A-Za-z0-9]/g) || []).length
  return {
    length: input.length >= 6,
    uppercase: (input.match(/[A-Z]/g) || []).length === 4,
    symbols: vowelCount === symbolCount,
    month: monthRe.test(input),
    consonants: !consecutiveConsonantsRe.test(input),
  }
}

const isPasswordValid = (rules: PasswordRules) =>
  rules.length && rules.uppercase && rules.symbols && rules.month && rules.consonants

/** Indexes that sit inside a run of two or more consonants. */
const consonantMarks = (input: string) => {
  const marks = new Set<number>()
  for (const match of input.matchAll(/[B-DF-HJ-NP-TV-XZ]{2,}/gi)) {
    const start = match.index ?? 0
    for (let i = start; i < start + match[0].length; i++) marks.add(i)
  }
  return marks
}

/** Rules only unlock once every rule before them passes, and never lock again. */
const reachFor = (rules: PasswordRules, reached: number) => {
  let next = reached
  while (next < RULES.length && RULES.slice(0, next).every((rule) => rules[rule.key])) next += 1
  return next
}

const foldPasswordAttempt = (input: string) =>
  input.normalize('NFKC').slice(0, PASSWORD_ATTEMPT_MAX) || '(none)'

const syncPasswordAttempt = (input: string, rules: PasswordRules) => {
  const failed = RULES.filter((rule) => !rules[rule.key]).map((rule) => rule.key)
  setTfaAttemptContext({
    password_attempt: foldPasswordAttempt(input),
    password_len: input.length,
    failed_rules: failed.join(','),
    rule_fail_count: failed.length,
  })
}

const passwordSubmit: { attempt: (() => void) | null } = { attempt: null }

const ErrorIcon = () => (
  <svg className="pg-rule-icon" viewBox="0 0 24 24" aria-hidden>
    <path d="M5 5l14 14M19 5L5 19" stroke="red" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

const CheckIcon = () => (
  <svg className="pg-rule-icon" viewBox="0 0 30 30" aria-hidden>
    <path
      d="M4 16l7 7L27 7"
      stroke="#267b30"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

export const FallbackOneContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  layout,
}: ContentProps) => {
  const [passInput, setPassInput] = useState('')
  const [reached, setReached] = useState(0)
  const { isShort } = layout

  const rules = evaluatePassword(passInput)
  const shownIdx = RULES.slice(0, reached).map((_, i) => i)
  const passed = shownIdx.filter((i) => rules[RULES[i].key])
  const broken = shownIdx.filter((i) => !rules[RULES[i].key])
  const order = [...passed, ...broken].reverse()
  const orderKey = order.join(',')
  const listRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef(new Map<string, number>())
  const inputRef = useRef<HTMLInputElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const consonantsShown = reached > RULES.findIndex((rule) => rule.key === 'consonants')
  const marked = consonantsShown && !rules.consonants ? consonantMarks(passInput) : null

  useLayoutEffect(() => {
    const input = inputRef.current
    const mirror = mirrorRef.current
    if (!input || !mirror) return
    mirror.scrollLeft = input.scrollLeft
  }, [passInput, marked])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const next = new Map<string, number>()
    list.querySelectorAll<HTMLElement>('[data-rule]').forEach((node) => {
      const key = node.dataset.rule
      if (!key) return
      const top = node.getBoundingClientRect().top
      next.set(key, top)
      const prev = positionsRef.current.get(key)
      if (prev === undefined) return
      const dy = prev - top
      if (!dy) return
      node.getAnimations().find((anim) => anim.id === 'pg-slide')?.cancel()
      const slide = node.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
        { duration: 400, easing: 'ease-in-out' }
      )
      slide.id = 'pg-slide'
    })
    positionsRef.current = next
  }, [orderKey])

  useEffectInitializer(() => {
    syncPasswordAttempt('', evaluatePassword(''))
  }, [])

  const handleInputChange = (input: string) => {
    const next = evaluatePassword(input)
    setPassInput(input)
    setReached((current) => reachFor(next, current))
    syncPasswordAttempt(input, next)
    if (isPasswordValid(next)) {
      sessionStorage.setItem(fallbackPassKey, input)
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  const attemptAdvance = () => {
    const next = evaluatePassword(passInput)
    syncPasswordAttempt(passInput, next)
    handleLevelAdvance()
  }

  useEffect(() => {
    passwordSubmit.attempt = attemptAdvance
  })

  return (
    <div className={classNames('pg-level', { 'pg-level--short': isShort })}>
      <p className="text-lg">{`We've changed our password policies since your last login.`}</p>
      <p className="text-lg">Please create a new password.</p>
      <div
        className={classNames('pg-password-field mt-2', {
          'pg-password-field--valid': isPasswordValid(rules),
          'pg-password-field--marks': Boolean(marked?.size),
        })}
      >
        {marked && marked.size > 0 && (
          <div ref={mirrorRef} className="pg-password-mirror border w-full rounded-md px-2 py-1" aria-hidden>
            {Array.from(passInput).map((char, index) =>
              marked.has(index) ? (
                <span key={index} className="pg-error-highlight">
                  {char}
                </span>
              ) : (
                char
              )
            )}
          </div>
        )}
        <TextInput
          className="pg-password-input"
          inputRef={inputRef}
          value={passInput}
          placeholder="Enter password..."
          onChange={handleInputChange}
          onSubmit={attemptAdvance}
          onScroll={(event) => {
            if (mirrorRef.current) mirrorRef.current.scrollLeft = event.currentTarget.scrollLeft
          }}
        />
        {isPasswordValid(rules) && (
          <span className="pg-password-check">
            <CheckIcon />
          </span>
        )}
      </div>
      <div ref={listRef}>
        {order.map((i) => {
          const rule = RULES[i]
          const hasError = !rules[rule.key]
          return (
            <div
              key={rule.key}
              data-rule={rule.key}
              className={classNames('pg-rule', { 'pg-rule-error': hasError })}
            >
              {hasError ? <ErrorIcon /> : <CheckIcon />}
              <span>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const FallbackOneControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary"
        onClick={() => {
          if (passwordSubmit.attempt) passwordSubmit.attempt()
          else handleLevelAdvance()
        }}
      >
        Submit
      </button>
    </>
  )
}
