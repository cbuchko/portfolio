import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
