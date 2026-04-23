import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 10% of traces in production; 100% in dev for easier debugging
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture 10% of replays on errors only — no session replays
  replaysOnErrorSampleRate: 0.1,
  replaysSessionSampleRate: 0,

  integrations: [Sentry.replayIntegration()],

  // Only enable in production to avoid noise during development
  enabled: process.env.NODE_ENV === 'production',
})
