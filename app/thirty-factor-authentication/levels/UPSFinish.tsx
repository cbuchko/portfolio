import { useEffect, useState } from 'react'
import { ContentProps, ControlProps } from './types'

export const UPSFinishContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  setIsLoading,
}: ContentProps) => {
  const [dynamicText, setDynamicText] = useState<string>('')
  const [vowelCount, setVowelCount] = useState('')

  useEffect(() => {
    const text = dynamicTextOptions[Math.floor(Math.random() * dynamicTextOptions.length)]
    setDynamicText(text)
    setIsLoading(false)
  }, [setIsLoading])

  const inputTarget = countVowels(rawText(dynamicText))

  const handleInputChange = (input: string) => {
    setVowelCount(input)
    if (inputTarget === parseInt(input)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  const paragraphGroups = rawText(dynamicText)
    .trim()
    .split(/\n\s*\n/)
  return (
    <>
      <div>
        {paragraphGroups.map((group, i) => {
          const lines = group.split('\n').map((line) => line.trim())
          // Doing it this way so the text is easily editable and usable by the vowel counter function
          if (i === 0) {
            return (
              <p key={i} className="text-lg">
                {lines[0]}
              </p>
            )
          } else if (i === 1) {
            return (
              <div key={i} className="text-md mt-4">
                {lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            )
          } else if (i === 2) {
            return (
              <div key={i} className="text-xs mt-4">
                {lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            )
          } else if (i === 3) {
            return (
              <div key={i} className="text-[10px] mt-4">
                {lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            )
          } else if (i === 4) {
            return (
              <div key={i} className="text-[8px] mt-4">
                {lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            )
          } else {
            return (
              <div key={i} className="text-[4px] mt-4">
                {lines.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            )
          }
        })}
      </div>
      <input
        className="border w-full rounded-md px-2 py-1 mt-4"
        placeholder="Enter your answer..."
        value={vowelCount}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
    </>
  )
}

export const UPSFinishControls = ({ handleLevelAdvance, setUPSTrackingTime }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary"
        onClick={() => {
          handleLevelAdvance()
          setUPSTrackingTime(0)
        }}
      >
        Submit
      </button>
    </>
  )
}

function countVowels(str: string): number {
  const matches = str.match(/[e]/gi)
  return matches ? matches.length : 0
}

const rawText = (dynamicText: string) => `
Time to use the physical authentication package UPS delivered to you.

You don't have it? Really?
I don't like to point fingers... but... did you do anything to upset them?

This is unprecedented. There aren't any backup levels.
There's got to be something you could do instead.
Maybe you could just tell me how many E's are in this body of text?
To prove you're not a robot or something like that I don't know.

You're saying counting E's is the exact thing a robot would be good at?
Copy and paste this whole thing into ChatGPT then. See if I care.
Or use the countless other websites that will tell you the answer.
I promise there aren't any bonus incentives for doing this honestly.

But do you really want to shortcut the struggle?
Is the victory in advancing to the next level, or in completing an arduous task?
Ultimately winning or losing is meaningless. But persevering is something to proud of.

${dynamicText}.
`

const dynamicTextOptions = [
  'lol made you read this tiny text',
  'Sorry if this was hard to read i still love you',
  'Just be glad i didnt ask you to count every vowel',
  'I feel bad about this one',
  'Made you look',
  'I believe in you, you can do this',
  'Fun fact: the original draft asked to count EVERY vowel',
  'LLMs are actually hilariously bad at these kinds of problems',
  'This text changes every time you play',
]
