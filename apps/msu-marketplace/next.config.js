/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kings/ui', '@kings/db', '@kings/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mlrcaugthlkscusyxqrf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
