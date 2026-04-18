import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">404</p>
        <h1 className="text-foreground mt-2 text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mt-4 text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
