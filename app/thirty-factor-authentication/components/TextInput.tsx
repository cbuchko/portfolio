import classNames from 'classnames'
import { type Ref, type UIEventHandler } from 'react'

export const TextInput = ({
  value,
  placeholder,
  className = 'mt-1',
  onChange,
  onSubmit,
  onClick,
  onFocus,
  onScroll,
  inputRef,
}: {
  value: string
  placeholder: string
  className?: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClick?: () => void
  onFocus?: () => void
  onScroll?: UIEventHandler<HTMLInputElement>
  inputRef?: Ref<HTMLInputElement>
}) => {
  return (
    <input
      ref={inputRef}
      className={classNames('border w-full rounded-md px-2 py-1', className)}
      placeholder={placeholder}
      value={value}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      onChange={(e) => onChange(e.target.value)}
      onClick={onClick}
      onFocus={onFocus}
      onScroll={onScroll}
      onKeyDown={(e) => {
        if (!value) return
        if (e.key === 'Enter' || e.key === 'enter') onSubmit()
      }}
    />
  )
}
