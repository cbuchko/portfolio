import { useEffect, useState } from 'react'
import { ContentProps } from './types'

export const IMDBContent = ({ playerId, handleLevelAdvance }: ContentProps) => {
  return (
    <>
      <p className="text-lg mb-1">Confirm the media you have appeared in.</p>
      <div className="flex gap-2">
        <MovieSearch />
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Submit
        </button>
      </div>
    </>
  )
}

const MovieSearch = () => {
  const [searchInput, setSearchInput] = useState('')
  const [movieResults, setMovieResults] = useState<Array<string>>([])
  const [debouncedInput, setDebouncedInput] = useState(searchInput)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedInput(searchInput)
    }, 300)

    return () => clearTimeout(id)
  }, [searchInput])

  const fetchTMDB = async (query: string) => {
    const tmdbResult = await fetch(`/api/movies?query=${query}`)
    const body = await tmdbResult.json()
    setMovieResults(body)
  }

  useEffect(() => {
    fetchTMDB(debouncedInput)
  }, [debouncedInput])

  return (
    <div className="relative w-full">
      <input
        className="border rounded-md p-1 px-2 w-full"
        onChange={(e) => setSearchInput(e.target.value)}
        value={searchInput}
        onClick={() => setIsDropdownVisible(true)}
      />
      {movieResults.length > 0 && isDropdownVisible && (
        <ul className="absolute bg-white h-max border w-full rounded-md mt-1">
          {movieResults.map((title, idx) => (
            <li
              key={idx}
              className="p-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSearchInput(title)
                setIsDropdownVisible(false)
              }}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const media: { id: string; url: string }[] = [
  { id: 'parks', url: '/thirty-factor-authentication/imdb/parks.jpg' },
  { id: 'westwing', url: '/thirty-factor-authentication/imdb/westwing.jpg' },
  { id: 'houseofcards', url: '/thirty-factor-authentication/imdb/houseofcards.jpg' },
  { id: 'lawandorder', url: '/thirty-factor-authentication/imdb/lawandorder.jpg' },
  // { id: 'sesamestreet', url: '/thirty-factor-authentication/imdb/sesamestreet.jpg' },
  { id: 'simpsons', url: '/thirty-factor-authentication/imdb/simpsons.jpg' },
  // { id: 'rickandmorty', url: '/thirty-factor-authentication/imdb/rickandmorty.jpg' },
  { id: 'willandgrace', url: '/thirty-factor-authentication/imdb/willandgrace.jpg' },
  // { id: 'glee', url: '/thirty-factor-authentication/imdb/glee.jpg' },
  { id: 'hotones', url: '/thirty-factor-authentication/imdb/hotones.jpg' },
  // { id: 'loveboat', url: '/thirty-factor-authentication/imdb/loveboat.webp' },
  // { id: 'maskedsinger', url: '/thirty-factor-authentication/imdb/maskedsinger.avif' },
  { id: 'xfiles', url: '/thirty-factor-authentication/imdb/xfiles.jpg' },
  { id: 'jimmykimmel', url: '/thirty-factor-authentication/imdb/jimmykimmel.webp' },
  // { id: 'billyonthestreet', url: '/thirty-factor-authentication/imdb/billyonthestreet.jpg' },
]
