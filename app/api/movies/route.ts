import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json([])
  }

  const tmdbKey = process.env.TMDB_API_KEY
  if (!tmdbKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not set' },
      { status: 500 }
    )
  }

  const tmdbResult = await fetch(
    `https://api.themoviedb.org/3/search/multi?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${tmdbKey}`,
      },
    }
  )

  if (!tmdbResult.ok) {
    return NextResponse.json(
      { error: 'TMDB request failed' },
      { status: tmdbResult.status }
    )
  }

  const payload = await tmdbResult.json()
  const body = payload.results as
    | {
        title: string
        name: string
        media_type: 'movie' | 'tv'
      }[]
    | undefined

  const titles = new Set<string>()
  body?.forEach((result) => {
    if (result.media_type === 'movie') titles.add(result.title)
    if (result.media_type === 'tv') titles.add(result.name)
  })
  return NextResponse.json(Array.from(titles))
}
