import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@ledo/shared'],
  images: {
    domains: ['lh3.googleusercontent.com', 'ledo.ai'],
  },
}

export default nextConfig
