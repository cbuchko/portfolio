import { PlayerInformation } from '../player-constants'
import { ContentProps, ControlProps } from './types'

export const DoubleNegativeContent = ({ playerId }: ContentProps) => {
  const name = PlayerInformation[playerId].name
  return (
    <>
      <h3 className="w-[350px] mb-2">{`Just double checking... you sure you're really ${name}?`}</h3>
      <h3>You wouldn't lie to me right?</h3>
    </>
  )
}

const controls: { text: string; truth?: boolean }[] = [
  { text: "That's Not Me!" },
  { text: "That's Me!!!!!! JUST KIDDING!" },
  { text: "That's Not Not Not Not Not Not Not Me!" },
  { text: 'On opposite day' },
  { text: "It wouldn't be inaccurate to say I couldn't not say that is me", truth: true },
  { text: "I don't know who that isn't" },
  { text: "I wouldn't lie to you but in this scenario I am making an exception" },
  { text: "This is a cruel game you're playing with me and I want no part of it any longer" },
]

function shuffle(array: { text: string; truth?: boolean }[]) {
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

export const DoubleNegativeControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <div className="max-w-[350px] flex flex-wrap justify-between gap-4">
      {shuffle(controls).map((control) => (
        <button
          className="auth-button min-w-[150px]"
          onClick={() => handleLevelAdvance(control.truth)}
        >
          {control.text}
        </button>
      ))}
    </div>
  )
}
