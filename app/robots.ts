import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { gameForHost, portfolioHostName } from './game-sites'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const game = gameForHost(portfolioHostName((await headers()).get('host')))
  if (!game?.host) {
    return { rules: { userAgent: '*', allow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `https://${game.host}/sitemap.xml`,
  }
}
