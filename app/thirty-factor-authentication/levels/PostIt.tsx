import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { clampPositionsToScreen } from '../utils'
import { TextInput } from '../components/TextInput'

const selectCode = () => {
  const index = Math.floor(Math.random() * codes.length)
  return codes[index]
}

export const PostItContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const codeRef = useRef(selectCode())
  const [keywordInput, setKeywordInput] = useState('')

  const handleInputChange = (input: string) => {
    setKeywordInput(input)
    if (codeRef.current.toLocaleLowerCase() === input.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="text-lg">
        When you created your account 15 years ago, you chose a secret recovery keyword.
      </p>
      <p className="text-lg">Please enter that now.</p>

      <TextInput
        value={keywordInput}
        placeholder="Enter the keyword..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />
      {notes.map((note, idx) => (
        <PostIt key={idx} message={note} />
      ))}
      <PostIt code={codeRef.current} />
    </>
  )
}

const getRandomPosition = () => {
  const halfwayDown = window.innerHeight / 2
  const height = window.innerHeight
  const y = Math.random() * (height - halfwayDown) + halfwayDown - 200
  const x = Math.random() * window.innerWidth - 200
  const { newX, newY } = clampPositionsToScreen(x, y, 200, 225)
  return { x: newX, y: newY }
}

const PostIt = ({ message, code }: { message?: string; code?: string }) => {
  const [position, setPosition] = useState(getRandomPosition())
  const noteRef = useRef<HTMLDivElement>(null)

  const handleDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    const note = noteRef.current
    if (!note) return

    const startPosition = { x: event.clientX, y: event.clientY }

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startPosition.x
      const dy = moveEvent.clientY - startPosition.y
      const newX = position.x + dx
      const newY = position.y + dy
      const clamped = clampPositionsToScreen(newX, newY, note.clientWidth, note.clientHeight)
      const newPos = {
        x: clamped.newX,
        y: clamped.newY,
      }
      setPosition(newPos)
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={noteRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      className={classNames(
        'h-[225px] w-[200px] p-4 bg-yellow-200 rounded-lg shadow-md text-black select-none !cursor-grab',
        { '-z-10': !!code }
      )}
      onMouseDown={handleDrag}
    >
      {!!code ? (
        <>
          <div className="underline font-bold">{`Don't Lose`}</div>
          Recovery Keyword:
          <div className="mt-8 italic">{code}</div>
        </>
      ) : (
        <div>{message}</div>
      )}
    </div>
  )
}

export const PostItControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}

const codes = [
  'zooweemama',
  'bazinga',
  'bababoowee',
  'chungus',
  'skibidi',
  'covfefe',
  'smorgasbord',
  'snickerdoodle',
  'bibbitybobbityboo',
]

const notes = [
  'Call Mom',
  'Pick up dry cleaning',
  'Dentist @ 2:30',
  'Pay phone bill',
  'Buy milk',
  'Groceries: eggs, spinach, coffee',
  'Laundry tonight',
  'Don’t forget umbrella ☂️',
  'Meeting 10AM sharp',
  'Cancel gym membership',
  'Water the plants',
  'Call bank re: statement',
  'Mail rent cheque',
  'Feed the cat',
  'Order new charger',
  'Print boarding pass',
  'Check tire pressure',
  'Finish report draft',
  'Renew passport',
  'Return library books',
  'Ask boss about Friday',
  'Buy birthday card',
  'Send follow-up email',
  'Take vitamins',
  'Pay credit card bill',
  'Charge laptop',
  'Pick up parcel',
  'Update resume',
  'Don’t forget lunch!',
  'Book haircut',
  'Refill prescription',
  'Call electrician',
  'Print invoice',
  'Get gas',
  'Bring notebook',
  'Check fridge before grocery trip',
  'Buy stamps',
  'Take out trash',
  'Text Mom back',
  'Call Grandpa',
  'Bring charger to office',
  'Try new recipe',
  'Research new phone plan',
  'Check oil level',
  'Don’t forget keys 🔑',
  'Stretch every hour',
  'Backup files',
  'Charge headphones',
  'Sign birthday card',
  'Schedule dentist cleaning',
  'Look into travel insurance',
  'Pick up dog food',
  'Drop off donation bag',
  'Cancel free trial',
  'Buy hand soap',
  'Post office before 5PM',
  'Double-check flight time',
  'Ask for refund',
  'Laundry detergent!!',
  'Read 10 pages tonight',
  'Don’t skip breakfast',
  'Bring jacket',
  'Coffee filters',
  'Check mail',
  'Email landlord',
  'Walk 10k steps',
  'Call insurance company',
  'Vacuum living room',
  'Don’t forget presentation notes',
  'Feed fish',
  'Refill water jug',
  'Buy batteries',
  'Print return label',
  'Plan weekend trip',
  'Call vet for appointment',
  'Clean desk',
  'Update software',
  'Pay parking ticket',
  'Check calendar for next week',
  'Stretch before bed',
  'Bring reusable bag',
  'Send invoice',
  'Backup photos',
  'Don’t forget sunglasses',
  'Confirm dinner reservation',
  'Buy detergent',
  'Check weather forecast',
  'Return borrowed book',
  'Buy paper towels',
  'Book eye exam',
  'Remember charger for trip',
  'Replace light bulb',
  'Buy toothpaste',
  'Message HR',
  'Turn off oven!',
  'Don’t forget ID',
  'Check fridge expiry dates',
  'Order groceries online',
  'Take vitamins after breakfast',
  'Update app passwords',
  'Return Amazon package',
  'Call plumber',
  'Bring lunchbox home',
  'Plan meals for week',
  'Pick up gift',
  'Charge power bank',
  'Call car service',
  'Send thank you note',
  'Print meeting agenda',
  'Buy wrapping paper',
  'Stretch + breathe',
  'New batteries for remote',
  'Update spreadsheet',
  'Declutter desk drawer',
  'Book massage',
  'Check credit score',
  'Drop keys off',
  'Change bedsheets',
  'Bring snacks',
  'Clean kitchen sink',
  'Don’t overthink it',
  'Relax — you got this!',
  'Breathe deeply',
  'Remember to smile 🙂',
  'Make today count',
  'Be kind to yourself',
  'Focus on one thing at a time',
  'You’re doing great',
  'Call it a day early if needed',
  'It’s okay to rest',
  'Tomorrow is another chance',
  'You’ve got this 💪',
]
