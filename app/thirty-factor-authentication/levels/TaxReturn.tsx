import { useMemo, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'

type TaxReturn = {
  income: number
  incomeTax: number
  cpp: number
  rrsp: number
  fhsa: number
  clergy: number
  cats: number
  charity: number
  nosePicker: number
  total: number
}

const generateRandomTaxNumbers = (): TaxReturn => {
  const income = Math.floor(Math.random() * (200000 - 100000) + 100000)
  const incomeTax = Math.floor(Math.random() * (60000 - 40000) + 40000)
  const cpp = Math.floor(Math.random() * (10000 - 4000) + 4000)
  const rrsp = Math.floor(Math.random() * (10000 - 5000) + 5000)
  const fhsa = Math.floor(Math.random() * (10000 - 5000) + 5000)
  const clergy = Math.floor(Math.random() * (10000 - 5000) + 5000)
  const cats = Math.ceil(Math.random() * 5)
  const charity = Math.ceil(Math.random() * 3)
  const nosePicker = Math.ceil(Math.random() * 25)

  const line36 = income - incomeTax - cpp
  const line43 = rrsp + fhsa
  const line44 = clergy * charity
  const line45 = cats * line43
  const line46 = Math.floor(line44 / nosePicker)
  const line47 = line45 + line46
  const total = line36 + line47

  return { income, incomeTax, cpp, rrsp, fhsa, clergy, cats, charity, nosePicker, total }
}

export const TaxReturnContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [nameInput, setNameInput] = useState('')

  const taxItems = useMemo(() => {
    return generateRandomTaxNumbers()
  }, [])

  const inputTarget = taxItems.total

  const { firstName, lastName, dob } = PlayerInformation[playerId].taxReturn

  const handleInputChange = (input: string) => {
    setNameInput(input)
    if (inputTarget === parseInt(input)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <h3>Enter your net income from your 2025 tax return.</h3>
      <input
        className="border w-full rounded-md mt-1 px-2 py-1"
        placeholder="Enter income..."
        value={nameInput}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
      <div className="absolute -bottom-12 border w-[475px] h-[470px] -translate-x-[50%] translate-y-[100%] left-[50%] shadow-xl p-2 bg-gray-100">
        <div className="text-center mb-2">2025 Income Tax Return</div>
        <div className="border w-max h-max">
          <div className="flex">
            <FormCell label="Last name" text={lastName} />
            <FormCell label="First name and initial(s)" text={firstName} />
            <FormCell label="Date of Birth (YYYY/MM/DD)" text={dob} />
          </div>
          <div className="border-t pb-1">
            <h3 className="text-sm p-2">Step 3 - Net Income</h3>
            <FormLineItem label="Employment income" amount={taxItems.income} number={33} />
            <FormLineItem label="Income tax deducted" amount={taxItems.incomeTax} number={34} />
            <FormLineItem label="Employee CPP contributions" amount={taxItems.cpp} number={35} />
            <FormLineItem label="Subtract line 34 and 35 from line 33" number={36} />
            <FormLineItem
              label="RRSP deduction (see Schedule 7 and attach receipts)"
              amount={taxItems.rrsp}
              number={37}
            />
            <FormLineItem
              label="FHSA deduction (see Schedule 15 and attach receipts)"
              amount={taxItems.fhsa}
              number={38}
            />
            <FormLineItem
              label="Clergy residence deduction (complete Form T1223)"
              amount={taxItems.clergy}
              number={39}
            />
            <FormLineItem
              label="Number of cats saved from trees"
              amount={taxItems.cats}
              number={40}
            />
            <FormLineItem
              label="Number of times donated by rounding up for charity"
              amount={taxItems.charity}
              number={41}
            />
            <FormLineItem label="Nose picker deduction" amount={taxItems.nosePicker} number={42} />
            <FormLineItem label="Add line 37 and line 38" number={43} />
            <FormLineItem label="Multiply line 39 and 41" number={44} />
            <FormLineItem label="Multiply line 40 by line 43" number={45} />
            <FormLineItem label="Divide line 44 by line 42 (round down)" number={46} />
            <FormLineItem label="Add line 45 and line 46" number={47} />
            <FormLineItem label="NET INCOME: Add line 36 and line 47" number={48} />
          </div>
        </div>
        <p className="text-[8px] max-w-[450px] px-2 mt-1">
          This by no means is meant to mimick a real government issued tax return and is merely for
          entertainment and parody purposes.
        </p>
      </div>
    </>
  )
}

type CellProps = {
  label: string
  text: string
}
const FormCell = ({ label, text }: CellProps) => {
  return (
    <div className="pl-2 pt-1 pr-4 w-max border-r">
      <div className="text-xs font-medium">{label}</div>
      <div className="text-xs font-light">{text}</div>
    </div>
  )
}

type LineItemProps = {
  label: string
  amount?: number
  number: number
}
const FormLineItem = ({ label, amount, number }: LineItemProps) => {
  return (
    <div className=" text-xs pl-2 pt-1 pr-4 mx-2 border-b flex justify-between items-end">
      <div>{label}</div>
      <div className="flex">
        <div className="bg-white px-2">{amount?.toLocaleString('en-us')}</div>
        <div className="translate-x-3 font-bold">{number}</div>
      </div>
    </div>
  )
}

export const TaxReturnControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
