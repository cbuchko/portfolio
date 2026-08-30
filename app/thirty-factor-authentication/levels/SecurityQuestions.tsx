import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { EasyTriviaQuestion, PlayerInformation } from '../player-constants'
import { shuffle } from '../utils'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

type PreparedQuestion = EasyTriviaQuestion & { options: string[] }

export const SecurityQuestionsContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
}: ContentProps) => {
  const [question, setQuestion] = useState<PreparedQuestion>()
  const [selected, setSelected] = useState<string>()

  useEffectInitializer(() => {
    const picked = shuffle([...PlayerInformation[playerId].easyTrivia])[0]
    setQuestion({
      ...picked,
      options: shuffle([...picked.options]),
    })
    setSelected(undefined)
    cancelAdvance()
  }, [playerId, cancelAdvance])

  const handleSelect = (option: string) => {
    setSelected(option)
    if (!question) return

    if (option === question.answer) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  if (!question) return null

  return (
    <>
      <p className="text-lg">
        Let&apos;s start with your Thirty Factor "Ultra Secure" Security Question™.
      </p>
      <p className="text-base mt-4 font-medium">{question.prompt}</p>
      <fieldset className="mt-3 border-0 p-0 m-0">
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="security-question"
                value={option}
                checked={selected === option}
                onChange={() => handleSelect(option)}
                className="cursor-pointer"
              />
              <span className="text-base">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}

export const SecurityQuestionsControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
