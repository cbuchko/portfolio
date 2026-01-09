import ThirtyFactorAuthentication from './ThirtyFactorAuthentication'

export const generateMetadata = () => {
  return {
    title: 'Thirty Factor Authentication',
    icons: {
      icon: '/thirty-factor-authentication/lock-logo.png',
    },
    description: 'Verify yourself by completing thirty different authentication challenges.',
  }
}

export default function ThirtyFactorAuthenticationContainer() {
  return <ThirtyFactorAuthentication />
}
