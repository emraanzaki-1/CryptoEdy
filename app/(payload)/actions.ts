'use server'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'

export const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config: (await import('@payload-config')).default,
    importMap: (await import('./importMap')).importMap,
  })
}
