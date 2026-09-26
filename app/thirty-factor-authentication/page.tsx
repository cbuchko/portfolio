import ThirtyFactorAuthentication from './ThirtyFactorAuthentication'
import type { Viewport } from 'next'
import { headers } from 'next/headers'
import { GAMES, PORTFOLIO_ORIGIN, gameCanonicalUrl, portfolioHostName } from '../game-sites'
import './light-lock.css'

const GAME = GAMES.find((game) => game.path === '/thirty-factor-authentication')!
const GAME_URL = gameCanonicalUrl(GAME)
const DESCRIPTION = 'Verify yourself by completing thirty different authentication challenges.'

export const generateMetadata = async () => {
  const host = portfolioHostName((await headers()).get('host'))
  const onGameDomain = host === GAME.host
  return {
    metadataBase: new URL(onGameDomain ? GAME_URL : PORTFOLIO_ORIGIN),
    alternates: { canonical: GAME_URL },
    title: 'Thirty Factor Authentication',
    description: DESCRIPTION,
    icons: {
      icon: '/thirty-factor-authentication/lock-logo.png',
    },
    openGraph: {
      title: 'Thirty Factor Authentication',
      description: DESCRIPTION,
      url: GAME_URL,
      siteName: 'Thirty Factor Authentication',
      type: 'website',
      images: [
        {
          url: '/thirty-factor-authentication/full-logo.png',
          alt: 'Thirty Factor Authentication',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: 'Thirty Factor Authentication',
      description: DESCRIPTION,
      images: ['/thirty-factor-authentication/full-logo.png'],
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'only light',
  themeColor: '#ffffff',
}

export default function ThirtyFactorAuthenticationContainer() {
  return <ThirtyFactorAuthentication />
}
