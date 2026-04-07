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

  /**
   * 301 Redirects — Proteção de SEO na Migração
   * 
   * Esses redirects mapeiam as URLs antigas da Loja Integrada para as novas do KingsHub.
   * Eles SÓ entram em vigor quando o domínio estiver apontando pra Vercel.
   * A loja antiga NÃO é afetada de forma alguma enquanto o DNS não for trocado.
   * 
   * Quando tivermos o CSV de produtos, vamos refinar os slugs individuais.
   */
  async redirects() {
    return [
      // Padrões conhecidos da Loja Integrada
      { source: '/categoria/:slug*', destination: '/produtos?categoria=:slug*', permanent: true },
      { source: '/produto/:slug', destination: '/produtos/:slug', permanent: true },
      { source: '/loja/busca', destination: '/produtos', permanent: true },
      { source: '/busca', destination: '/produtos', permanent: true },
      { source: '/carrinho', destination: '/checkout', permanent: true },
      { source: '/minha-conta', destination: '/account', permanent: true },
      { source: '/pagina/sobre', destination: '/', permanent: true },
      { source: '/pagina/contato', destination: '/', permanent: true },
      // Marketplace MSU (se havia URLs do Firebase antigo)
      { source: '/meu-simulador-usado', destination: '/usado', permanent: true },
      { source: '/marketplace', destination: '/usado', permanent: true },
    ]
  },
}

module.exports = nextConfig
// RESTART DEV SERVER
