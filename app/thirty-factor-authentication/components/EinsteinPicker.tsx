'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

type EinsteinPickerProps = {
  open: boolean
  options: string[]
  selected?: string
  onSelect: (option: string) => void
  onClose: () => void
}

export const EinsteinPicker = ({
  open,
  options,
  selected,
  onSelect,
  onClose,
}: EinsteinPickerProps) => {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[1100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close picker"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-lg border-t bg-white px-4 pt-3 shadow-lg"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-gray-300" />
        <div className="flex flex-col">
          {options.map((option) => {
            const isSelected = selected === option
            return (
              <button
                key={option}
                type="button"
                className={classNames('min-h-11 px-2 text-left text-base capitalize', {
                  'bg-gray-100 font-medium': isSelected,
                })}
                onClick={() => onSelect(isSelected ? '' : option)}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}
