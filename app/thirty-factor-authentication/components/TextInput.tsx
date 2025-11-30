export const TextInput = ({
  value,
  placeholder,
  onChange,
  onSubmit,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onSubmit: () => void
}) => {
  return (
    <input
      className="border w-full rounded-md mt-1 px-2 py-1"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'enter') onSubmit()
      }}
    />
  )
}
