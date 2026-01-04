import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const tmdbResult = await fetch(
    `https://api.themoviedb.org/3/search/multi?include_adult=false&language=en-US&page=1&query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    }
  )

  const body = (await tmdbResult.json()).results as {
    title: string
    name: string
    media_type: 'movie' | 'tv'
  }[]
  const titles = new Set()
  body?.forEach((result) => {
    if (result.media_type === 'movie') titles.add(result.title)
    if (result.media_type === 'tv') titles.add(result.name)
  })
  return NextResponse.json(Array.from(titles))
}
