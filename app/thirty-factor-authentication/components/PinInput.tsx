import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

type PinInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  length?: number
}

const EMPTY = ' '
const onlyDigits = (raw: string) => raw.replace(/\D/g, '')

const toSlots = (value: string, length: number) =>
  Array.from({ length }, (_, i) => {
    const char = value[i]
    return !char || char === EMPTY ? '' : char
  })

const toValue = (slots: string[]) => slots.map((slot) => slot || EMPTY).join('')

export const PinInput = ({ value, onChange, onSubmit, length = 6 }: PinInputProps) => {
  const captureRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [draft, setDraft] = useState('')

  const slots = toSlots(value, length)

  useEffect(() => {
    captureRef.current?.focus()
  }, [])

  const commit = (next: string[]) => onChange(toValue(next))

  const writeDigits = (digits: string, from = activeIndex) => {
    if (!digits) return
    const next = slots.slice()
    let index = from
    for (const digit of digits) {
      if (index >= length) break
      next[index] = digit
      index += 1
    }
    commit(next)
    setActiveIndex(Math.min(index, length - 1))
  }

  const deleteAt = (index: number) => {
    const next = slots.slice()
    if (next[index]) {
      next[index] = ''
      commit(next)
      setActiveIndex(index)
      return
    }
    if (index > 0) {
      next[index - 1] = ''
      commit(next)
      setActiveIndex(index - 1)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'enter') {
      if (onlyDigits(value)) onSubmit()
      return
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault()
      writeDigits(e.key)
      return
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      deleteAt(activeIndex)
      return
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveIndex((index) => Math.max(0, index - 1))
      return
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveIndex((index) => Math.min(length - 1, index + 1))
    }
  }

  const handleDraftChange = (raw: string) => {
    const incoming = onlyDigits(raw)
    setDraft('')
    writeDigits(incoming)
  }

  const handleCellClick = (index: number, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setActiveIndex(index)
    captureRef.current?.focus()
  }

  return (
    <div className="pin-input">
      {slots.map((digit, index) => (
        <button
          key={index}
          type="button"
          tabIndex={-1}
          className={classNames('pin-input-cell', {
            'pin-input-cell--active': focused && index === activeIndex,
            'pin-input-cell--filled': Boolean(digit),
          })}
          aria-hidden
          onClick={(e) => handleCellClick(index, e)}
        >
          {digit}
        </button>
      ))}
      <input
        ref={captureRef}
        className="pin-input-capture"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Authenticator code"
        value={draft}
        onChange={(e) => handleDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}
