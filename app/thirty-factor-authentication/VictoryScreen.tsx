import { LevelProps } from './levels/useLevel'
import { PlayerIds, PlayerInformation } from './player-constants'
import { formatElapsedTime } from './utils'

export const VictoryScreen = ({
  playerId,
  levelProps,
}: {
  playerId: PlayerIds
  levelProps: LevelProps
}) => {
  const { startTime, resetLevel } = levelProps
  const characterName = PlayerInformation[playerId].name
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] h-[50%]">
      <div className="bg-green-100 p-8 rounded-md shadow-lg">
        <h2 className="text-4xl mb-4">Congratulations, you successfully authenticated!</h2>
        <p className="text-lg">
          You authenticated as {characterName} in {formatElapsedTime(startTime)}.
        </p>
        <p className="text-lg">
          Your reward is a sense of pride and accomplishment. And bragging rights.
        </p>
        <button
          className="mt-2 auth-button"
          onClick={() => {
            resetLevel()
          }}
        >
          Restart
        </button>
      </div>
      <div className="mt-8">
        <p className="text-md">
          Thank you for playing my game. It means a lot to me that you got this far.
        </p>
        <p className="text-md mt-2">
          Thank you to Neal Agarwal, the creator behind{' '}
          <a href="https://neal.fun/" target="_blank" rel="noreferrer" className="underline">
            neal.fun
          </a>
          , for inspiring this entire concept.
        </p>
        <p className="text-md mt-2">
          Thank you Lucas Pope, Toby Fox, Eric Barone, Dean Herbert and Tonda Ros for creating some
          of my favourite games ever and directly inspiring levels of this game.
        </p>
        <p className="mt-4">Soundtrack:</p>
        <ul className="list-disc ml-4">
          <li>{`Rythm Challenge: "Open the Skies" by Kxdama`}</li>
          <li>{`Fishing: "Fishing Song" by Kai Mikkelsen`}</li>
          <li>{`Final Level: "Death by Glamour" by Toby Fox from Undertale`}</li>
        </ul>
      </div>
    </div>
  )
}
