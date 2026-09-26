import ThirtyFactorAuthentication from './ThirtyFactorAuthentication'
import type { Viewport } from 'next'
import { headers } from 'next/headers'
import './light-lock.css'

const GAME_HOST = 'thirtyfactorauthentication.com'

export const generateMetadata = async () => {
  const host = (await headers()).get('host')?.split(':')[0]?.toLowerCase()
  const onGameDomain = host === GAME_HOST
  return {
    metadataBase: new URL(
      onGameDomain ? `https://${GAME_HOST}` : 'https://www.connorbuchko.com',
    ),
    alternates: {
      canonical: onGameDomain ? '/' : '/thirty-factor-authentication',
    },
    title: 'Thirty Factor Authentication',
    icons: {
      icon: '/thirty-factor-authentication/lock-logo.png',
    },
    description: 'Verify yourself by completing thirty different authentication challenges.',
  }
}

export const viewport: Viewport = {
  colorScheme: 'only light',
  themeColor: '#ffffff',
}

export default function ThirtyFactorAuthenticationContainer() {
  return <ThirtyFactorAuthentication />
}
