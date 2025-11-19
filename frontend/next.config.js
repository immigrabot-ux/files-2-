/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
