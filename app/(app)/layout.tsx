import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { Toaster } from 'sonner'
import { BackToTop } from '@/components/common/back-to-top'
import '../globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CryptoEdy — Premium Crypto Research & Analysis',
  description:
    'Access high-conviction token picks, macro analysis, and airdrop guides. Join 300,000+ investors.',
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
        <SessionProvider>{children}</SessionProvider>
        <BackToTop />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
