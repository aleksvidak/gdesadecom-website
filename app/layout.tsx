import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gdesadecom.rs'),
  title: {
    default: 'Gde sa decom? — Aktivnosti za decu u Srbiji | Igralište app',
    template: '%s | Gde sa decom?',
  },
  description:
    'Pronađite najbolja igrališta, kreativne radionice, sportske aktivnosti i događaje za decu u Beogradu i Srbiji.',
  keywords: [
    'aktivnosti za decu',
    'igrališta Beograd',
    'radionice za decu',
    'dečji rođendani',
    'sportske aktivnosti deca',
    'gde sa decom',
    'igralište app',
  ],
  authors: [{ name: 'Gde sa decom?' }],
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://gdesadecom.rs',
    siteName: 'Gde sa decom?',
    title: 'Gde sa decom? — Aktivnosti za decu u Srbiji',
    description:
      'Pronađite najbolja igrališta, radionice i događaje za decu.',
    images: [
      {
        url: '/screenshots/app_map_v3.png',
        width: 1200,
        height: 630,
        alt: 'Gde sa decom? — Platforma za dečje aktivnosti u Srbiji',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gde sa decom? — Aktivnosti za decu u Srbiji',
    description:
      'Pronađite najbolja igrališta, radionice i događaje za decu.',
    images: ['/screenshots/app_map_v3.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://gdesadecom.rs',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <head>
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T8K623H5B0"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T8K623H5B0');
          `}
        </Script>
      </head>
      <body className={`${nunito.variable} font-sans bg-[#fafafa] text-[#1a1a1a] leading-relaxed`}>
        {children}
      </body>
    </html>
  )
}
