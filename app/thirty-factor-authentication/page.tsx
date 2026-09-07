import ThirtyFactorAuthentication from './ThirtyFactorAuthentication'
import type { Viewport } from 'next'
import './light-lock.css'

export const generateMetadata = () => {
  return {
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
