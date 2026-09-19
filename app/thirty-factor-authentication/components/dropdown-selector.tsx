import { useEffect, useState } from 'react'
import classNames from 'classnames'
import Image from 'next/image'

type DropdownSelectorProps = {
  id: string
  activeId?: string
  setActiveId: (id?: string) => void
  defaultOption?: string
  options: string[]
  onOptionSelect: (option: string) => void
  width: number | string
  label?: string
  includeBlankOption?: boolean
  compact?: boolean
}

export const DropdownSelector = ({
  id,
  activeId,
  setActiveId,
  defaultOption,
  options,
  width,
  label,
  onOptionSelect,
  includeBlankOption = true,
  compact,
}: DropdownSelectorProps) => {
  const [selectedOption, setSelectedOption] = useState(defaultOption)
  const isOpen = id === activeId

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    onOptionSelect(option)
    setActiveId()
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const element = e.target as HTMLElement
      const dropdownElement = document.querySelector(`#${id}`)
      if (element.contains(dropdownElement)) {
        setActiveId(undefined)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [id, setActiveId])

  return (
    <div
      id={id}
      className="relative min-w-0"
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
    >
      <h5>{label}</h5>
      <button
        className={classNames(
          'border rounded-sm py-1 px-2 flex justify-between items-center cursor-pointer w-full overflow-hidden whitespace-nowrap',
          { outline: isOpen }
        )}
        onClick={() => (isOpen ? setActiveId() : setActiveId(id))}
      >
        <div className="min-h-6 capitalize">{selectedOption}</div>
        <div className={classNames('w-3 h-3 transition-transform', { 'rotate-180': isOpen })}>
          <Image
            src="/thirty-factor-authentication/icons/chevron-down.svg"
            alt="down"
            width={12}
            height={12}
          />
        </div>
      </button>
      {isOpen && (
        <div
          className={classNames(
            'absolute mt-0.5 bg-white w-full border rounded-md z-100 overflow-y-auto',
            compact ? 'max-h-[min(12.5rem,40dvh)]' : 'max-h-[min(16rem,45dvh)]'
          )}
        >
          {(includeBlankOption ? ['', ...options] : [...options]).map((sign, idx) => (
            <div
              key={idx}
              onClick={() => handleOptionSelect(sign)}
              className={classNames(
                'px-2 cursor-pointer hover:bg-gray-100 capitalize overflow-hidden whitespace-nowrap',
                compact ? 'py-1 min-h-8 text-sm' : 'py-2 min-h-[40px]'
              )}
            >
              {sign}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
