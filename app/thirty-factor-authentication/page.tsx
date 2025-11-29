import ThirtyFactorAuthentication from './ThirtyFactorAuthentication'

export const generateMetadata = () => {
  return {
    title: 'Thirty Factor Authentication',
    icons: {
      icon: '/thirty-factor-authentication/lock-logo.png',
    },
  }
}

export default function ThirtyFactorAuthenticationContainer() {
  return <ThirtyFactorAuthentication />
}
