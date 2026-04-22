import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'sonner'
import { BackToTop } from '@/components/common/back-to-top'
import '../globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const SITE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'CryptoEdy — Premium Crypto Research & Analysis',
  description:
    'Access high-conviction token picks, macro analysis, and airdrop guides. Join 300,000+ investors.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'CryptoEdy — Premium Crypto Research & Analysis',
    description:
      'Access high-conviction token picks, macro analysis, and airdrop guides. Join 300,000+ investors.',
    siteName: 'CryptoEdy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoEdy — Premium Crypto Research & Analysis',
    description:
      'Access high-conviction token picks, macro analysis, and airdrop guides. Join 300,000+ investors.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body
        className="bg-surface text-on-surface font-body flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-on-primary focus:text-body-sm focus:shadow-elevated sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:px-4 focus:py-2 focus:font-semibold"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
        <BackToTop />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
