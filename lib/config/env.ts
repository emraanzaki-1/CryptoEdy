/**
 * Startup environment validator.
 * Throws loudly if any required variable is missing — never fails silently.
 * Import this at the top of your entry points or in next.config.ts.
 */

const required = [
  'DATABASE_URL',
  'PAYLOAD_SECRET',
  'AUTH_SECRET',
  'NEXTAUTH_URL',
  'RESEND_API_KEY',
] as const

type RequiredEnvKey = (typeof required)[number]

function validateEnv(): Record<RequiredEnvKey, string> {
  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[CryptoEdy] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
    )
  }

  return Object.fromEntries(required.map((key) => [key, process.env[key]!])) as Record<
    RequiredEnvKey,
    string
  >
}

export const env = validateEnv()
