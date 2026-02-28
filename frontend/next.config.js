/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
}

module.exports = nextConfig