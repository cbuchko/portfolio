import { useMemo, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { EasyTriviaQuestion, PlayerInformation } from '../player-constants'
import { shuffle } from '../utils'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

const questionsPerRun = 1

type PreparedQuestion = EasyTriviaQuestion & { options: string[] }

export const SecurityQuestionsContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
}: ContentProps) => {
  const [questions, setQuestions] = useState<PreparedQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string>()

  useEffectInitializer(() => {
    const pool = shuffle([...PlayerInformation[playerId].easyTrivia])
    const picked = pool.slice(0, questionsPerRun).map((q) => ({
      ...q,
      options: shuffle([...q.options]),
    }))
    setQuestions(picked)
    setQuestionIndex(0)
    setSelected(undefined)
    cancelAdvance()
  }, [playerId, cancelAdvance])

  const current = questions[questionIndex]
  const isLast = questionIndex >= questions.length - 1

  const progressLabel = useMemo(() => {
    if (questions.length <= 1) return ''
    return `Question ${questionIndex + 1} of ${questions.length}`
  }, [questionIndex, questions.length])

  const handleSelect = (option: string) => {
    setSelected(option)
    if (!current) return

    if (option !== current.answer) {
      cancelAdvance()
      return
    }

    if (isLast) {
      validateAdvance()
      return
    }

    cancelAdvance()
    setQuestionIndex((index) => index + 1)
    setSelected(undefined)
  }

  if (!current) return null

  return (
    <>
      <p className="text-lg">
        Please answer your security question.
      </p>
      {progressLabel && <p className="text-sm text-gray-500 mt-1">{progressLabel}</p>}
      <p className="text-base mt-4 font-medium">{current.prompt}</p>
      <div className="mt-3 flex flex-col gap-2">
        {current.options.map((option) => {
          const isSelected = selected === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={classNames(
                'w-full text-left px-3 py-2 border rounded-md cursor-pointer transition-colors',
                {
                  'border-blue-400 bg-blue-50': isSelected,
                  'border-gray-300 bg-white hover:bg-gray-50': !isSelected,
                }
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
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
