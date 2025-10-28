import ChevronDown from '@/public/thirty-factor-authentication/icons/chevron-down.svg'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

type DropdownSelectorProps = {
  id: string
  activeId?: string
  setActiveId: (id?: string) => void
  defaultOption: string
  options: string[]
  onOptionSelect: (option: string) => void
  width: number
  label?: string
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
    <div id={id} className="relative" style={{ width: `${width}px` }}>
      <h5>{label}</h5>
      <button
        className={classNames(
          'border rounded-sm py-1 px-2 flex justify-between items-center cursor-pointer w-full',
          { outline: isOpen }
        )}
        onClick={() => (isOpen ? setActiveId() : setActiveId(id))}
      >
        <div>{selectedOption}</div>
        <div className={classNames('w-3 h-3 transition-transform', { 'rotate-180': isOpen })}>
          <ChevronDown />
        </div>
      </button>
      {isOpen && (
        <div className="absolute mt-0.5 bg-white w-full border rounded-md">
          {options.map((sign, idx) => (
            <div
              key={idx}
              onClick={() => handleOptionSelect(sign)}
              className="py-2 px-2 cursor-pointer hover:bg-gray-100"
            >
              {sign}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
