import type { NextConfig } from 'next'

const POSTHOG_PROXY = '/factor-relay'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: `${POSTHOG_PROXY}/static/:path*`,
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: `${POSTHOG_PROXY}/array/:path*`,
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: `${POSTHOG_PROXY}/:path*`,
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn3.iconfinder.com',
        port: '',
        pathname: '/data/icons/spring-23/32/leaf-spring-plant-ecology-green-512.png',
      },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rule: any) => rule.test instanceof RegExp && rule.test.test('.svg')
    )

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
  turbopack: {},
}

export default nextConfig
