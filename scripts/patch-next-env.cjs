// Preload environment variables BEFORE any ESM imports
// (ESM imports are hoisted, so dotenv.config() in the main script runs too late)
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

// Patch @next/env for ESM default-import interop under tsx
// Payload's loadEnv.js does `import nextEnvImport from '@next/env'`
// which tsx transpiles to `require('@next/env').default` — undefined for CJS modules.
const Module = require('module')
const env = require('@next/env')
if (!env.default) {
  env.default = env
}
const origLoad = Module._load
Module._load = function (request, parent, isMain) {
  const result = origLoad.call(this, request, parent, isMain)
  if (request === '@next/env' && result && !result.default) {
    result.default = result
  }
  return result
}

