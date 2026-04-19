import Link from 'next/link'

export function HeroSection() {
  return (
    <div
      className="flex min-h-[480px] flex-col items-center justify-center gap-8 bg-cover bg-center bg-no-repeat p-8 md:min-h-[540px] md:p-12"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(11, 28, 48, 0.4), rgba(0, 62, 199, 0.6)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuWmH5pPRQOqtA7h8xEfRxdDasSxUnl5cu8g71R_okh_LUO4zwIaFGbXN0evggqJmlTP4hw3PmmJnaLviE9m4wdCcrxACscuPsiRAGboxKFxQTMLSr5TvbIJMfctlEaDV7RxZ9l3p0AMRcUgFnevihmeCFjdSgejBCOzcvKSLbEfdW3KFPSyhes5esEHm0tRgak-n1ki7Y4b2e03omKFyGi-M5RaSmqdwwen39vnR3dpQZtE2I3wZd3n4V-1u2lRZIrsnRfJtKT1rm')",
      }}
    >
      <div className="flex max-w-3xl flex-col gap-4 text-center">
        <h1 className="text-on-primary md:text-display text-4xl leading-[1.05] font-black tracking-[-0.04em]">
          Institutional-Grade Crypto Research for the Modern Investor
        </h1>
        <p className="text-inverse-primary mx-auto max-w-2xl text-base leading-relaxed font-normal md:text-lg">
          Actionable insights, high-conviction picks, and expert analysis designed to cut through
          the noise and deliver measurable edge.
        </p>
      </div>
      <div className="mt-2 flex w-full flex-col justify-center gap-4 px-4 sm:w-auto sm:flex-row sm:px-0">
        <Link
          href="/register"
          className="from-primary to-primary-container text-on-primary flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b px-6 py-3.5 text-base leading-normal font-bold tracking-[0.015em] shadow-lg transition-transform hover:-translate-y-1"
        >
          Join CryptoEdy Pro
        </Link>
        <Link
          href="/feed"
          className="text-on-primary flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-base leading-normal font-bold tracking-[0.015em] backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/20"
        >
          Explore Free Analysis
        </Link>
      </div>
    </div>
  )
}
