import Link from 'next/link'
import { Logo } from '@/components/common/logo'

export function Footer() {
  return (
    <footer className="bg-primary text-on-primary mt-auto px-4 py-16 md:px-8 lg:px-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 flex flex-col justify-between gap-12 md:flex-row">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo textClassName="text-on-primary" className="text-on-primary" />
            <p className="text-on-primary-container text-sm leading-relaxed opacity-80">
              The Digital Curator of institutional-grade financial intelligence for the modern
              digital asset investor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="text-on-primary text-sm font-bold tracking-wider uppercase">
                Platform
              </h4>
              <Link
                href="/feed"
                className="text-on-primary-container hover:text-on-primary text-sm transition-colors"
              >
                Research Archive
              </Link>
              <Link
                href="#"
                className="text-on-primary-container hover:text-on-primary text-sm transition-colors"
              >
                Track Record
              </Link>
              <Link
                href="/upgrade"
                className="text-on-primary-container hover:text-on-primary text-sm transition-colors"
              >
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-on-primary text-sm font-bold tracking-wider uppercase">Legal</h4>
              <Link
                href="#"
                className="text-on-primary-container hover:text-on-primary text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-on-primary-container hover:text-on-primary text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-on-primary-container hover:text-on-primary text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="border-on-primary/20 flex flex-col gap-4 border-t pt-8">
          <p className="text-on-primary-container text-xs leading-relaxed opacity-70">
            <strong>Disclaimer:</strong> The information provided by CryptoEdy is for educational
            and informational purposes only. It does not constitute financial, investment, or
            trading advice. Cryptocurrencies are highly volatile assets, and past performance is not
            indicative of future results. Always conduct your own due diligence before making
            investment decisions.
          </p>
          <p className="text-on-primary-container text-xs opacity-60">
            &copy; {new Date().getFullYear()} CryptoEdy Research. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
