import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Display } from '@/components/ui/typography'

interface AuthSplitLayoutProps {
  children: React.ReactNode
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left editorial panel */}
      <div className="bg-inverse-surface relative hidden w-1/2 flex-col justify-end p-12 lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity dark:opacity-10 dark:mix-blend-normal dark:brightness-50"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuWmH5pPRQOqtA7h8xEfRxdDasSxUnl5cu8g71R_okh_LUO4zwIaFGbXN0evggqJmlTP4hw3PmmJnaLviE9m4wdCcrxACscuPsiRAGboxKFxQTMLSr5TvbIJMfctlEaDV7RxZ9l3p0AMRcUgFnevihmeCFjdSgejBCOzcvKSLbEfdW3KFPSyhes5esEHm0tRgak-n1ki7Y4b2e03omKFyGi-M5RaSmqdwwen39vnR3dpQZtE2I3wZd3n4V-1u2lRZIrsnRfJtKT1rm')",
          }}
        />
        <div className="from-inverse-surface via-inverse-surface/80 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="relative z-10">
          <Display className="text-inverse-on-surface mb-4">
            The Digital
            <br />
            Curator.
          </Display>
          <p className="text-inverse-on-surface/70 text-body-lg max-w-md">
            Institutional-grade crypto research and market intelligence, curated for the modern
            investor.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="bg-surface relative flex w-full flex-1 flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <Link
          href="/"
          className="text-on-surface-variant hover:text-primary text-body-sm absolute top-6 left-6 flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          Return
        </Link>
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  )
}
