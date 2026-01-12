import { CSSProperties, useMemo, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { clampPositionsToScreen } from '../utils'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { useElementDrag } from '../useElementDrag'

const selectCode = () => {
  const index = Math.floor(Math.random() * codes.length)
  return codes[index]
}

export const PostItContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  isMobile,
}: ContentProps) => {
  const [code, setCode] = useState<string>('')
  const [keywordInput, setKeywordInput] = useState('')

  useEffectInitializer(() => {
    setCode(selectCode())
  }, [])

  const handleInputChange = (input: string) => {
    setKeywordInput(input)
    if (code.toLocaleLowerCase() === input.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  //use way less post its on mobile because its so much harder there
  const postItNotes = useMemo(() => {
    if (!isMobile) return notes
    return notes.slice(0, 50)
  }, [isMobile])

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
      {postItNotes.map((note, idx) => (
        <PostIt key={idx} message={note} isMobile={isMobile} />
      ))}
      <PostIt code={code} isMobile={isMobile} />
    </>
  )
}

const getRandomPosition = (height: number, width: number, isMobile?: boolean) => {
  const halfwayDown = window.innerHeight / 2
  const viewportHeight = window.innerHeight

  const y = Math.random() * (viewportHeight - halfwayDown) + halfwayDown - height
  const x = Math.random() * window.innerWidth - width
  const { newX, newY } = clampPositionsToScreen(x, y, width, height, 1, isMobile)
  return { x: newX, y: newY }
}

const PostIt = ({
  message,
  code,
  isMobile,
}: {
  message?: string
  code?: string
  isMobile?: boolean
}) => {
  const [postStyles, setPostStyles] = useState<CSSProperties>()
  const noteRef = useRef<HTMLDivElement>(null)

  const { position, handlePointerDown, setPosition } = useElementDrag(noteRef, undefined, 0.6)

  useEffectInitializer(() => {
    const height = isMobile ? 225 * 0.6 : 225
    const width = isMobile ? 200 * 0.6 : 200
    setPosition(getRandomPosition(height, width, isMobile))
    const randomizedTextPosition = Math.floor(Math.random() * (100 - 50) + 50)
    const randomizedFontSize = Math.floor(Math.random() * (36 - 24) + 24)
    const randomizedTextAlign = Math.random() > 0.2 ? 'left' : 'right'
    setPostStyles({
      marginTop: randomizedTextPosition,
      fontSize: randomizedFontSize,
      textAlign: randomizedTextAlign,
    })
  }, [isMobile])

  if (!position) return null

  return (
    <div
      ref={noteRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        touchAction: 'none',
      }}
      className={classNames(
        'h-[225px] w-[200px] flex p-4 bg-yellow-200 rounded-lg shadow-md text-black select-none !cursor-grab z-2 post-it liebe-heide overflow-hidden',
        { '!z-1': !!code, 'scale-60': isMobile }
      )}
      onPointerDown={handlePointerDown}
    >
      {!!code ? (
        <div>
          <p className="text-2xl liebe-heide">**Recovery Keyword:**</p>
          <p className="mt-8 text-md">{code}</p>
        </div>
      ) : (
        <div className="leading-8" style={postStyles}>
          {message}
        </div>
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
]

const notes = [
  'Call Mom',
  'Pick up dry cleaning',
  'Dentist @ 2:30',
  'Pay phone bill',
  'Buy milk',
  'Groceries: eggs, spinach, coffee',
  'Laundry tonight',
  'Don’t forget umbrella',
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
  'Don’t forget keys',
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
  'Check fridge expiry dates',
  'Order groceries online',
  'Take vitamins after breakfast',
  'Update app passwords',
]
