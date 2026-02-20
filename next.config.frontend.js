/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['localhost', 'api.deiverbum.com.br'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
  trailingSlash: true,
}

module.exports = nextConfig
