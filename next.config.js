/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'arweave.net', 'ipfs.io'],
  },
}

module.exports = nextConfig
