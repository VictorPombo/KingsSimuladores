import type { Metadata, Viewport } from 'next'
import '@kings/ui/globals.css'
import '@/components/store/layout/responsive.css'
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kingssimuladores.com.br'),
  title: 'Kings Simuladores — Simuladores de Corrida Premium',
  description:
    'A maior loja de simuladores de corrida do Brasil. Cockpits, volantes, pedais e acessórios das melhores marcas com até 12x sem juros.',
  keywords: [
    'simulador de corrida',
    'cockpit simulador',
    'volante simulador',
    'sim racing',
    'Kings Simuladores',
    'meu simulador usado',
  ],
  openGraph: {
    title: 'Kings Simuladores',
    description: 'Simuladores de Corrida Premium',
    url: 'https://www.kingssimuladores.com.br',
    siteName: 'Kings Simuladores',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kings Simuladores',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'KingsHub',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

import { StreamingBackground } from '@kings/ui'

import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable}`} style={{ backgroundColor: '#06080f' }}>
      <head>
        {/* Fontes agora gerenciadas nativamente pelo Next.js */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1416641970482316');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1416641970482316&ev=PageView&noscript=1" alt="" />
        </noscript>
        {/* Google Analytics 4 (GA4) */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        {/* Google Ads Tag (AW-11399026698) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-11399026698"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-11399026698');
          `}
        </Script>
      </head>
      <body className="font-body">
        <StreamingBackground />
        {children}
      </body>
    </html>
  )
}
