import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerIds, PlayerInformation } from '../player-constants'
import { DropdownSelector } from '../components/dropdown-selector'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { setTfaAttemptContext } from '../analytics'
import { ExtrasPortal } from '../components/ExtrasPortal'
import { getHoroscope } from './zodiac-horoscopes'
const signs = [
  'Aries',
  'Aquarius',
  'Cancer',
  'Capricorn',
  'Gemini',
  'Leo',
  'Libra',
  'Pisces',
  'Sagittarius',
  'Scorpio',
  'Taurus',
  'Virgo',
]

const defaultSign = 'Aries'

const syncZodiacAttempt = (sun: string, moon: string, ascendant?: string) => {
  setTfaAttemptContext({
    sun,
    moon,
    // Analytics property keeps its original name so past events still line up.
    rising: ascendant ?? '(none)',
    zodiac_attempt: (ascendant
      ? `${sun}-${moon}-${ascendant}`
      : `${sun}-${moon}`
    ).toLocaleLowerCase(),
  })
}

export const ZodiacContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  layout,
}: ContentProps) => {
  const { isNarrow: isMobile, isShort } = layout
  const [activeDropdownId, setActiveDropdownId] = useState<string>()

  const [selectedSun, setSelectedSun] = useState(defaultSign)
  const [selectedMoon, setSelectedMoon] = useState(defaultSign)
  const [selectedAscendant, setSelectedAscendant] = useState(defaultSign)

  const targetZodiac = PlayerInformation[playerId].zodiac
  const needsAscendant = targetZodiac.split('-').length === 3

  useEffectInitializer(() => {
    syncZodiacAttempt(defaultSign, defaultSign, needsAscendant ? defaultSign : undefined)
  }, [])

  const handleZodiacSelect = (option: string, type: 'sun' | 'moon' | 'ascendant') => {
    let sunRes = selectedSun
    let moonRes = selectedMoon
    let ascendantRes = selectedAscendant
    if (type === 'sun') {
      sunRes = option
      setSelectedSun(option)
    } else if (type === 'moon') {
      moonRes = option
      setSelectedMoon(option)
    } else {
      ascendantRes = option
      setSelectedAscendant(option)
    }

    const ascendantForAttempt = needsAscendant ? ascendantRes : undefined
    syncZodiacAttempt(sunRes, moonRes, ascendantForAttempt)
    const optionResult = ascendantForAttempt
      ? `${sunRes}-${moonRes}-${ascendantForAttempt}`
      : `${sunRes}-${moonRes}`
    if (targetZodiac.toLocaleLowerCase() === optionResult.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="mb-4 text-lg">Please confirm your zodiac alignment.</p>
      <div
        className={classNames('flex gap-4', {
          'flex-col items-center': isMobile,
          'justify-between': needsAscendant && !isMobile,
          'justify-center': !needsAscendant && !isMobile,
        })}
      >
        <DropdownSelector
          id={'zodiac-sun'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'sun')}
          width={150}
          label={'Sun'}
          compact={isShort}
        />
        <DropdownSelector
          id={'zodiac-moon'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'moon')}
          width={150}
          label={'Moon'}
          compact={isShort}
        />
        {needsAscendant && (
          <DropdownSelector
            id={'zodiac-ascendant'}
            activeId={activeDropdownId}
            setActiveId={setActiveDropdownId}
            options={signs}
            onOptionSelect={(option) => handleZodiacSelect(option, 'ascendant')}
            width={150}
            label={'Ascendant'}
            compact={isShort}
          />
        )}
      </div>
      <ExtrasPortal>
        <HoroscopeClipping playerId={playerId} />
      </ExtrasPortal>
    </>
  )
}

const HoroscopeClipping = ({ playerId }: { playerId: ContentProps['playerId'] }) => {
  const { date, paragraphs } = getHoroscope(playerId)
  const source =
    playerId === PlayerIds.Conan
      ? { href: 'https://www.astrotheme.com/', label: 'astrotheme.com' }
      : { href: 'https://astro-charts.com/persons/', label: 'astro-charts.com' }
  return (
    <div className="horoscope-clipping-shadow">
      <div className="horoscope-clipping-tear">
        <article className="horoscope-clipping">
          <div className="horoscope-nameplate">The Evening Almanac</div>
          <div className="horoscope-folio">
            <span>Section C</span>
            <span>Stars &amp; Signs</span>
            <span>Page 14</span>
          </div>
          <div className="horoscope-kicker">Astrology</div>
          <h2 className="horoscope-headline">
            Horoscope for Birthdate <span className="horoscope-date">{date}</span>
          </h2>
          <div className="horoscope-byline">Your stars, as they stood the day you arrived</div>
          {paragraphs.map((text, idx) => (
            <p key={idx} className="horoscope-body">
              {text}
            </p>
          ))}
          <p className="horoscope-fine-print">
            Chart readings courtesy of{' '}
            <a href={source.href} target="_blank" rel="noopener noreferrer">
              {source.label}
            </a>
            .
          </p>
        </article>
      </div>
    </div>
  )
}

export const ZodiacControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
