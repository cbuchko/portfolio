import { useEffect, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { DropdownSelector } from '../components/dropdown-selector'

type CategoryIds = 'color' | 'nationality' | 'drink' | 'cigarette' | 'pet'
type Answer = Record<number, Record<CategoryIds, string>>

export const EinsteinContent = ({ validateAdvance, cancelAdvance }: ContentProps) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string>()

  const [selectedAnswers, setSelectedAnswers] = useState<Answer>({})

  const handleAnswerSelect = (option: string, houseNumber: number, categoryId: CategoryIds) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [houseNumber]: { ...prevAnswers[houseNumber], [categoryId]: option },
    }))
  }

  useEffect(() => {
    console.log(JSON.stringify(selectedAnswers), JSON.stringify(AnswerKey))
    if (JSON.stringify(AnswerKey) === JSON.stringify(selectedAnswers)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [selectedAnswers])

  return (
    <>
      <h3>As you may know, per our platforms terms, you must have an IQ of 130+ to enter.</h3>
      <h3 className="mb-4">Please prove you meet our standards by solving this puzzle.</h3>
      <ul className="grid grid-cols-2 text-sm gap-1 gap-x-12 list-disc ml-4">
        {rules.map((rule) => (
          <li>{rule}</li>
        ))}
      </ul>
      <h3 className="mt-3">
        Submit only after <span className="font-bold">all</span> dropdowns are correctly filled.
      </h3>
      <div className="grid grid-cols-6 gap-4 items-center justify-center -translate-x-4 mt-8 select-none">
        <div />
        <h5 className="text-center font-medium translate-y-2">House #1</h5>
        <h5 className="text-center font-medium translate-y-2">House #2</h5>
        <h5 className="text-center font-medium translate-y-2">House #3</h5>
        <h5 className="text-center font-medium translate-y-2">House #4</h5>
        <h5 className="text-center font-medium translate-y-2">House #5</h5>
        <SelectionContainer
          id="color"
          options={colors}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          handleSelect={(option, houseNumber, categoryId) =>
            handleAnswerSelect(option, houseNumber, categoryId)
          }
        />
        <SelectionContainer
          id="nationality"
          options={nationalites}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          handleSelect={(option, houseNumber, categoryId) =>
            handleAnswerSelect(option, houseNumber, categoryId)
          }
        />
        <SelectionContainer
          id="drink"
          options={drinks}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          handleSelect={(option, houseNumber, categoryId) =>
            handleAnswerSelect(option, houseNumber, categoryId)
          }
        />
        <SelectionContainer
          id="cigarette"
          options={cigarettes}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          handleSelect={(option, houseNumber, categoryId) =>
            handleAnswerSelect(option, houseNumber, categoryId)
          }
        />
        <SelectionContainer
          id="pet"
          options={pets}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          handleSelect={(option, houseNumber, categoryId) =>
            handleAnswerSelect(option, houseNumber, categoryId)
          }
        />
      </div>
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
      <h5 className="capitalize text-center translate-x-2">{id}</h5>
      <DropdownSelector
        id={`${id}-1`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 1, id)}
        width={150}
      />
      <DropdownSelector
        id={`${id}-2`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 2, id)}
        width={150}
      />
      <DropdownSelector
        id={`${id}-3`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 3, id)}
        width={150}
      />
      <DropdownSelector
        id={`${id}-4`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 4, id)}
        width={150}
      />
      <DropdownSelector
        id={`${id}-5`}
        activeId={activeDropdownId}
        setActiveId={setActiveDropdownId}
        options={options}
        onOptionSelect={(option) => handleSelect(option, 5, id)}
        width={150}
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

const colors = ['red', 'blue', 'yellow', 'green', 'white']
const nationalites = ['brit', 'swede', 'dane', 'norwegian', 'german']
const drinks = ['tea', 'coffee', 'milk', 'beer', 'water']
const cigarettes = ['pall mall', 'dunhill', 'prince', 'blends', 'blue master']
const pets = ['dogs', 'birds', 'horses', 'fish', 'cats']

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
