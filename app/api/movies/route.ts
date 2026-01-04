import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const tmdbResult = await fetch(
    `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    }
  )

  const body = (await tmdbResult.json()).results as { title: string }[]
  const titles = body?.map((result) => result.title)
  const dedupe = new Set(titles)
  return NextResponse.json(Array.from(dedupe))
}
