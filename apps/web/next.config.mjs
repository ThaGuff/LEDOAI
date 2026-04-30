import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com', 'ledo.ai'],
  },
  webpack: (config) => {
    // Explicit alias so Railway NIXPACKS resolves @/* regardless of CWD during build
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    }
    return config
  },
}

export default nextConfig
