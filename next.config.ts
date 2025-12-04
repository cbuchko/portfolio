import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    // Look for the existing svg rule
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test instanceof RegExp && rule.test.test('.svg')
    )

    if (fileLoaderRule) {
      // Exclude .svg from the default file-loader
      fileLoaderRule.exclude = /\.svg$/i
    }

    // Add SVGR handling for .svg imports
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

export default nextConfig
