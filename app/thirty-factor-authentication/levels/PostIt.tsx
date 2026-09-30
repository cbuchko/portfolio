import { CSSProperties, useMemo, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { clampPositionsToScreen } from '../utils'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { useElementDrag } from '../useElementDrag'
import { readViewportSize } from '../useTfaLayout'

const selectCode = () => {
  const index = Math.floor(Math.random() * codes.length)
  return codes[index]
}

export const PostItContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  layout,
}: ContentProps) => {
  const { isNarrow, fit } = layout
  // Phone-only: smaller notes so they fit a narrow screen. Desktop keeps 1:1.
  const noteScale = isNarrow ? Math.min(0.6, fit) : 1
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

  // Fewer notes on phones only — short desktops still get the full pile.
  const postItNotes = useMemo(() => {
    if (!isNarrow) return notes
    return notes.slice(0, 50)
  }, [isNarrow])

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
        <PostIt key={idx} message={note} scale={noteScale} isNarrow={isNarrow} />
      ))}
      <PostIt code={code} scale={noteScale} isNarrow={isNarrow} />
    </>
  )
}

const noteHeight = 200
const noteWidth = 200

/**
 * Notes land under the auth card. A few may tuck into its bottom edge so the
 * pile still looks messy, but the keyword field stays clear. If the card
 * already fills the screen, they sit as low as they can.
 */
const getRandomPosition = (height: number, width: number, allowPartialOffscreen: boolean) => {
  const { width: vw, height: vh } = readViewportSize()
  const cardBottom = document.getElementById('auth-container')?.getBoundingClientRect().bottom
  const floor = cardBottom ?? vh / 2
  const tuckUnderCard = Math.random() < 0.2
  const minY = tuckUnderCard ? floor - height * 0.4 : floor
  const maxY = Math.max(minY, vh - height)
  const y = minY + Math.random() * (maxY - minY)
  const x = Math.random() * vw - width
  const { newX, newY } = clampPositionsToScreen(x, y, width, height, 1, allowPartialOffscreen)
  return { x: newX, y: newY }
}

const between = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(options: T[]) => options[Math.floor(Math.random() * options.length)]

type Hand = { block: CSSProperties; words: CSSProperties[] }

/** Mostly canary yellow, like a real desk, with the odd neon pad mixed in. */
const NOTE_COLORS = [
  '#fef68a',
  '#fef68a',
  '#fef68a',
  '#fdf28b',
  '#ffd7e8',
  '#ffc2dc',
  '#c9f2ff',
  '#d4f7b4',
  '#ffdcae',
]

/**
 * One person's scrawl for one note: a tilted, slanted block with uneven
 * spacing, and words that drift off the line a little. Some notes run out of
 * room and cram the last word.
 */
const makeHand = (message: string): Hand => {
  const words = message.split(' ')
  const drift = between(0.6, 2.2)
  const wobble = between(0.5, 3)
  const cramLast = words.length > 2 && Math.random() < 0.25

  return {
    block: {
      marginTop: between(14, 54),
      marginLeft: between(-4, 10),
      marginRight: between(-4, 8),
      fontSize: between(22, 32),
      lineHeight: between(1.05, 1.45),
      letterSpacing: `${between(-0.6, 1.4)}px`,
      wordSpacing: `${between(0, 6)}px`,
      textAlign: pick<CSSProperties['textAlign']>(['left', 'left', 'left', 'center', 'right']),
      color: pick(['#171717', '#171717', '#1f2a44', '#1e3a8a', '#3f3f46']),
      transform: `rotate(${between(-4.5, 4.5)}deg) skewX(${between(-7, 4)}deg)`,
      transformOrigin: 'top left',
    },
    words: words.map((_, i) => {
      const last = i === words.length - 1
      return {
        display: 'inline-block',
        transform: `translateY(${between(-drift, drift)}px) rotate(${between(-wobble, wobble)}deg)`,
        ...(cramLast && last ? { fontSize: '0.78em', letterSpacing: '-0.8px' } : null),
      }
    }),
  }
}

const PostIt = ({
  message,
  code,
  scale,
  isNarrow,
}: {
  message?: string
  code?: string
  scale: number
  isNarrow: boolean
}) => {
  const [hand, setHand] = useState<Hand>()
  const [codeTilt, setCodeTilt] = useState<{ heading: string; code: string }>()
  const [look, setLook] = useState<{ color: string; tilt: number }>()
  const noteRef = useRef<HTMLDivElement>(null)

  const { position, handlePointerDown, setPosition, isDragging } = useElementDrag(
    noteRef,
    undefined,
    {
      scale,
      allowPartialOffscreen: isNarrow,
    }
  )

  useEffectInitializer(() => {
    setPosition(getRandomPosition(noteHeight * scale, noteWidth * scale, isNarrow))
    if (message) setHand(makeHand(message))
    setLook({ color: pick(NOTE_COLORS), tilt: between(-5, 5) })
    setCodeTilt({
      heading: `rotate(${between(-3, 2)}deg)`,
      code: `rotate(${between(-4, 4)}deg) translateX(${between(0, 14)}px)`,
    })
  }, [])

  if (!position) return null

  return (
    <div
      ref={noteRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        touchAction: 'none',
        scale,
        rotate: `${look?.tilt ?? 0}deg`,
        transformOrigin: 'top left',
        ...({ '--note': look?.color } as CSSProperties),
      }}
      className={classNames(
        'h-[200px] w-[200px] flex p-4 text-black select-none !cursor-grab z-2 post-it liebe-heide overflow-hidden',
        { '!z-1': !!code, 'post-it--lifted': isDragging }
      )}
      onPointerDown={handlePointerDown}
    >
      {!!code ? (
        <div>
          <p
            className="text-2xl liebe-heide"
            style={{ transform: codeTilt?.heading, transformOrigin: 'top left' }}
          >
            **Recovery Keyword:**
          </p>
          <p
            className="mt-8 text-md"
            style={{ transform: codeTilt?.code, transformOrigin: 'top left' }}
          >
            {code}
          </p>
        </div>
      ) : (
        <div style={hand?.block}>
          {message?.split(' ').map((word, i) => (
            <span key={i}>
              {i > 0 && ' '}
              <span style={hand?.words[i]}>{word}</span>
            </span>
          ))}
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
