import { useEffect, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { DropdownSelector } from '../components/dropdown-selector'
import { EinsteinPicker } from '../components/EinsteinPicker'
import classNames from 'classnames'

type CategoryIds = 'color' | 'nationality' | 'drink' | 'cigarette' | 'pet'
type Answer = Record<number, Record<CategoryIds, string>>
type PickerTarget = { house: number; category: CategoryIds }

const colors = ['red', 'blue', 'yellow', 'green', 'white']
const nationalites = ['brit', 'swede', 'dane', 'norwegian', 'german']
const drinks = ['tea', 'coffee', 'milk', 'beer', 'water']
const cigarettes = ['pall mall', 'dunhill', 'prince', 'blends', 'blue master']
const pets = ['dogs', 'birds', 'horses', 'fish', 'cats']

const HOUSES = [1, 2, 3, 4, 5] as const
const CATEGORIES: { id: CategoryIds; label: string; options: string[] }[] = [
  { id: 'color', label: 'Color', options: colors },
  { id: 'nationality', label: 'Nat.', options: nationalites },
  { id: 'drink', label: 'Drink', options: drinks },
  { id: 'cigarette', label: 'Smoke', options: cigarettes },
  { id: 'pet', label: 'Pet', options: pets },
]

export const EinsteinContent = ({ validateAdvance, cancelAdvance, layout }: ContentProps) => {
  const { isMobile } = layout
  const [activeDropdownId, setActiveDropdownId] = useState<string>()
  const [cluesOpen, setCluesOpen] = useState(true)
  const [picker, setPicker] = useState<PickerTarget | null>(null)

  const [selectedAnswers, setSelectedAnswers] = useState<Answer>({})

  const handleAnswerSelect = (option: string, houseNumber: number, categoryId: CategoryIds) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [houseNumber]: { ...prevAnswers[houseNumber], [categoryId]: option },
    }))
  }

  useEffect(() => {
    if (deepEqualAnswer(AnswerKey, selectedAnswers)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [selectedAnswers, cancelAdvance, validateAdvance])

  const pickerCategory = picker ? CATEGORIES.find((category) => category.id === picker.category) : null

  return (
    <>
      <p className="text-lg">
        As you may know, per our platforms terms, you must have an IQ of 130+ to enter.
      </p>
      <p className="text-lg mb-4">Please prove you meet our standards by solving this puzzle.</p>
      {isMobile ? (
        <div className="mb-3 border">
          <button
            type="button"
            className={classNames(
              'flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-medium',
              { 'border-b': cluesOpen }
            )}
            onClick={() => setCluesOpen((open) => !open)}
            aria-expanded={cluesOpen}
          >
            <span>Clues · {rules.length}</span>
            <span aria-hidden>{cluesOpen ? '−' : '+'}</span>
          </button>
          {cluesOpen && (
            <ul className="list-disc space-y-1 px-3 py-3 pl-7 text-sm">
              {rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 text-sm gap-1 gap-x-12 list-disc ml-4">
          {rules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      )}
      <p className="text-lg mt-3">
        Submit only after <span className="font-bold">all</span> dropdowns are correctly filled.
      </p>
      {isMobile ? (
        <MobileStreetBoard
          selectedAnswers={selectedAnswers}
          onCellClick={(house, category) => setPicker({ house, category })}
        />
      ) : (
        <div className="mt-8 grid w-full max-w-[min(56rem,calc(100vw-3rem))] grid-cols-[minmax(5.5rem,auto)_repeat(5,minmax(0,1fr))] items-center gap-2 select-none">
          <div />
          <h5 className="text-center text-sm font-medium sm:text-base">House #1</h5>
          <h5 className="text-center text-sm font-medium sm:text-base">House #2</h5>
          <h5 className="text-center text-sm font-medium sm:text-base">House #3</h5>
          <h5 className="text-center text-sm font-medium sm:text-base">House #4</h5>
          <h5 className="text-center text-sm font-medium sm:text-base">House #5</h5>
          <SelectionContainer
            id="color"
            options={colors}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            handleSelect={handleAnswerSelect}
          />
          <SelectionContainer
            id="nationality"
            options={nationalites}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            handleSelect={handleAnswerSelect}
          />
          <SelectionContainer
            id="drink"
            options={drinks}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            handleSelect={handleAnswerSelect}
          />
          <SelectionContainer
            id="cigarette"
            options={cigarettes}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            handleSelect={handleAnswerSelect}
          />
          <SelectionContainer
            id="pet"
            options={pets}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            handleSelect={handleAnswerSelect}
          />
        </div>
      )}
      <EinsteinPicker
        open={!!picker}
        options={pickerCategory?.options ?? []}
        selected={picker ? selectedAnswers[picker.house]?.[picker.category] : undefined}
        onSelect={(option) => {
          if (!picker) return
          handleAnswerSelect(option, picker.house, picker.category)
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
      />
    </>
  )
}

const MobileStreetBoard = ({
  selectedAnswers,
  onCellClick,
}: {
  selectedAnswers: Answer
  onCellClick: (house: number, category: CategoryIds) => void
}) => {
  return (
    <div className="mt-4 select-none">
      <div className="grid grid-cols-[2.4rem_repeat(5,minmax(0,1fr))] gap-1">
        <div />
        {HOUSES.map((house) => (
          <div key={house} className="text-center text-xs font-medium">
            #{house}
          </div>
        ))}
        {CATEGORIES.map((category) => (
          <MobileCategoryRow
            key={category.id}
            category={category}
            selectedAnswers={selectedAnswers}
            onCellClick={onCellClick}
          />
        ))}
      </div>
    </div>
  )
}

const MobileCategoryRow = ({
  category,
  selectedAnswers,
  onCellClick,
}: {
  category: (typeof CATEGORIES)[number]
  selectedAnswers: Answer
  onCellClick: (house: number, category: CategoryIds) => void
}) => {
  return (
    <>
      <div className="flex items-center text-[10px] font-medium leading-tight">{category.label}</div>
      {HOUSES.map((house) => {
        const value = selectedAnswers[house]?.[category.id]
        return (
          <button
            key={`${category.id}-${house}`}
            type="button"
            onClick={() => onCellClick(house, category.id)}
            className={classNames(
              'min-h-11 w-full truncate border px-0.5 text-[10px] capitalize leading-tight',
              { 'text-gray-400': !value }
            )}
          >
            {value || '—'}
          </button>
        )
      })}
    </>
  )
}

type SelectionContainerProps = {
  id: CategoryIds
  activeDropdownId?: string
  options: string[]
  setActiveDropdownId: (id?: string) => void
  handleSelect: (option: string, houseNumber: number, category: CategoryIds) => void
}

const SelectionContainer = ({
  id,
  options,
  activeDropdownId,
  setActiveDropdownId,
  handleSelect,
}: SelectionContainerProps) => {
  return (
    <>
      <h5 className="min-w-0 capitalize text-center text-sm leading-tight">{id}</h5>
      <DropdownSelector
        id={`${id}-1`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 1, id)}
        width="100%"
      />
      <DropdownSelector
        id={`${id}-2`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 2, id)}
        width="100%"
      />
      <DropdownSelector
        id={`${id}-3`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 3, id)}
        width="100%"
      />
      <DropdownSelector
        id={`${id}-4`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 4, id)}
        width="100%"
      />
      <DropdownSelector
        id={`${id}-5`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 5, id)}
        width="100%"
      />
    </>
  )
}

export const EinsteinControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}

const rules = [
  'The Brit lives in the Red house.',
  'The Swede keeps Dogs as pets.',
  'The Dane drinks Tea.',
  'The Green house is exactly to the left of the White house.',
  'The owner of the Green house drinks Coffee.',
  'The person who smokes Pall Mall rears Birds.',
  'The owner of the Yellow house smokes Dunhill.',
  'The man living in the centre house drinks Milk.',
  'The Norwegian lives in the first house.',
  'The man who smokes Blends lives next to the one who keeps Cats.',
  'The man who keeps Horses lives next to the man who smokes Dunhill.',
  'The man who smokes Blue Master drinks Beer.',
  'The German smokes Prince.',
  'The Norwegian lives next to the Blue house.',
  'The man who smokes Blends has a neighbour who drinks Water.',
]

const AnswerKey: Answer = {
  [1]: {
    color: 'yellow',
    nationality: 'norwegian',
    drink: 'water',
    cigarette: 'dunhill',
    pet: 'cats',
  },
  [2]: {
    color: 'blue',
    nationality: 'dane',
    drink: 'tea',
    cigarette: 'blends',
    pet: 'horses',
  },
  [3]: {
    color: 'red',
    nationality: 'brit',
    drink: 'milk',
    cigarette: 'pall mall',
    pet: 'birds',
  },
  [4]: {
    color: 'green',
    nationality: 'german',
    drink: 'coffee',
    cigarette: 'prince',
    pet: 'fish',
  },
  [5]: {
    color: 'white',
    nationality: 'swede',
    drink: 'beer',
    cigarette: 'blue master',
    pet: 'dogs',
  },
}

function deepEqualAnswer(a: Answer, b: Answer): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  for (const key of aKeys) {
    if (!b.hasOwnProperty(key)) return false

    const aInner = a[key as unknown as number]
    const bInner = b[key as unknown as number]

    for (const category of Object.keys(aInner) as CategoryIds[]) {
      if (aInner[category] !== bInner[category]) return false
    }
  }

  return true
}
