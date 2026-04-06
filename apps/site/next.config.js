/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kings/ui', '@kings/db', '@kings/utils', '@kings/payments', '@kings/shipping', '@kings/notifications'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mlrcaugthlkscusyxqrf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

module.exports = nextConfig
