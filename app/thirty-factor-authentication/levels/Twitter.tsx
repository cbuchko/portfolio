import Image from 'next/image'
import { ContentProps } from './types'
import { useState } from 'react'
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity'

export const Twitter = ({ handleLevelAdvance }: ContentProps) => {
  const [message, setMessage] = useState('')
  const [tweetText, setTweetText] = useState('')

  const attemptPost = () => {
    const matcher = new RegExpMatcher({
      ...englishDataset.build(),
      ...englishRecommendedTransformers,
    })

    if (/(.)\1{4,}/.test(tweetText)) {
      setMessage("I have a feeling you're just holding down a key... Put some effort in.")
      return
    }

    if (matcher.hasMatch(tweetText)) {
      setMessage("Wow! Look at the mouth on you! Let's tone down the swears please :)")
      return
    }

    if (tweetText.trim().endsWith('.')) {
      setMessage('Did you seriously end your tweet with a period? Are you human?')
      return
    }

    if (tweetText.length < 50) {
      setMessage('That tweet is so short. Put some effort in.')
      return
    }

    if (tweetText.length > 200) {
      setMessage('Nobody is reading that essay. Cut it back.')
      return
    }

    if (countChar(tweetText, ' ') < 5) {
      setMessage('Stop spamming random characters and write a real tweet.')
      return
    }

    if (countChar(tweetText, '#') === 0) {
      setMessage("No hastags? Is it really a tweet if there's no hashtags?")
      return
    }
    if (countChar(tweetText, '#') < 5) {
      setMessage('A few more hashtags should do the trick!')
      return
    }

    if (countChar(tweetText, '!') < 2) {
      setMessage("You don't sound very excited. Add some flare.")
      return
    }

    if (!tweetText.includes('?')) {
      setMessage('You should ask a question if you want any engagement at all.')
      return
    }

    // Require a fancy long word (10+ letters)
    const longWord = tweetText.split(/\s+/).some((w) => w.length >= 10 && w[0] !== '#')
    if (!longWord) {
      setMessage('Long words make you sound SMART. Add long words.')
      return
    }

    // Require at least one ALL CAPS word
    if (!tweetText.split(/\s+/).some((w) => /^[A-Z]{3,}$/.test(w))) {
      setMessage('ALL CAPS IS REALLY GOOD FOR EMPHASIS WHEN USED SPARINGLY.')
      return
    }

    if (
      countPhrase(tweetText, 'Thirty Factor Authentication') < 1 &&
      countPhrase(tweetText, 'thirtyfactorauthentication') < 1
    ) {
      setMessage('If you could mention the name of the game that would be awesome!')
      return
    }

    handleLevelAdvance(true)
  }

  return (
    <div>
      <p className="text-lg">To verify yourself as a Twitter user, please post a Tweet.</p>
      <div className="my-4 border border-gray-300 px-4 pb-2 flex gap-1">
        <Image
          src={`/thirty-factor-authentication/portraits/joe.avif`}
          alt="headshot"
          className="rounded-full h-[40px] mt-2"
          height={40}
          width={40}
          draggable={false}
        />
        <div>
          <textarea
            className="w-[350px] resize-none border-none focus:border-none focus:outline-none p-2 text-xl mt-1 h-max field-sizing-content"
            placeholder="What's happening?"
            draggable={false}
            onChange={(e) => setTweetText(e.target.value)}
            value={tweetText}
          />
          <div className="border-b border-gray-300 mb-2" />
          <div className="w-full flex justify-end">
            <button
              className="bg-black text-white text-sm rounded-2xl font-bold p-2 px-4 disabled:bg-gray-500 active:bg-gray-800 cursor-pointer"
              disabled={!tweetText}
              onClick={attemptPost}
            >
              Post
            </button>
          </div>
        </div>
      </div>
      <p>{message}</p>
    </div>
  )
}

function countChar(str: string, char: string): number {
  // Escape special regex characters
  const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'g')
  return (str.match(regex) || []).length
}

function countPhrase(str: string, phrase: string): number {
  // Escape special regex characters
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'gi') // no word boundaries
  return (str.match(regex) || []).length
}
