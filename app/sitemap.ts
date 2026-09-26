import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { GAMES, PORTFOLIO_ORIGIN, gameCanonicalUrl, gameForHost, portfolioHostName } from './game-sites'

const PORTFOLIO_PAGES = ['/', '/blog']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const game = gameForHost(portfolioHostName((await headers()).get('host')))
  if (game?.host) {
    return [{ url: gameCanonicalUrl(game), changeFrequency: 'weekly', priority: 1 }]
  }

  return [
    ...PORTFOLIO_PAGES.map((path) => ({ url: new URL(path, PORTFOLIO_ORIGIN).toString() })),
    ...GAMES.filter((entry) => !entry.host).map((entry) => ({ url: gameCanonicalUrl(entry) })),
  ]
}
