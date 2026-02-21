/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    domains: ['localhost', 'api.deiverbum.com.br', 'picsum.photos'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://187.77.45.220:3333',
  },
}

module.exports = nextConfig
