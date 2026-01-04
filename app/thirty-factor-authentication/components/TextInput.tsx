import classNames from 'classnames'

export const TextInput = ({
  value,
  placeholder,
  className = 'mt-1',
  onChange,
  onSubmit,
  onClick,
}: {
  value: string
  placeholder: string
  className?: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClick: () => void
}) => {
  return (
    <input
      className={classNames('border w-full rounded-md px-2 py-1', className)}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'enter') onSubmit()
      }}
    />
  )
}
