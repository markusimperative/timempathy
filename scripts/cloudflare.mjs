import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'

// A project-local Wrangler configuration keeps OAuth credentials separate
// from other projects. Never inherit global API credentials.
const env = { ...process.env }
for (const name of [
  'CLOUDFLARE_API_TOKEN',
  'CF_API_TOKEN',
  'CLOUDFLARE_API_KEY',
  'CF_API_KEY',
  'CLOUDFLARE_EMAIL',
  'CF_EMAIL',
  'CLOUDFLARE_ACCOUNT_ID',
  'CF_ACCOUNT_ID',
])
  delete env[name]
// Wrangler prefers a legacy home directory over XDG configuration. Refuse that
// fallback rather than reading or replacing another project's credentials.
if (existsSync(resolve(homedir(), '.wrangler'))) {
  throw Error(
    'A legacy global Wrangler directory would override project isolation. Configure a separate deployment environment before continuing.',
  )
}
env.XDG_CONFIG_HOME = resolve('.local/cloudflare/config')
env.WRANGLER_SEND_METRICS = 'false'
env.WRANGLER_LOG_PATH = resolve('.local/cloudflare/logs')
env.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = 'false'
const args = process.argv.slice(2)
if (args[0] === 'auth' && !args.includes('--help')) {
  throw Error('Use the project-local login command. Never print authorization tokens.')
}
const local =
  args.includes('--local') ||
  args.includes('--dry-run') ||
  args.includes('--help') ||
  args[0] === 'types'
if (!local && (args[0] === 'deploy' || (args[0] === 'd1' && args.includes('--remote')))) {
  const config = JSON.parse(
    (await readFile('wrangler.jsonc', 'utf8'))
      .replace(/^\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1'),
  )
  if (
    !/^[a-f0-9]{32}$/.test(config.account_id ?? '') ||
    config.d1_databases?.[0]?.database_id === '00000000-0000-0000-0000-000000000000'
  ) {
    throw Error(
      'Set this project’s Cloudflare account and D1 database IDs before remote deployment. See DEPLOYMENT.md.',
    )
  }
  if (args[0] === 'deploy') {
    for (const name of ['PUBLIC_ORIGIN', 'ADDITIONAL_PUBLIC_ORIGIN']) {
      const value = config.vars[name]
      if (name === 'ADDITIONAL_PUBLIC_ORIGIN' && value === undefined) continue
      const origin = new URL(value)
      if (origin.protocol !== 'https:' || origin.origin !== value)
        throw Error(`${name} must be the exact HTTPS origin, without a trailing slash.`)
    }
  }
}
const child = spawn(process.execPath, [resolve('node_modules/wrangler/bin/wrangler.js'), ...args], {
  env,
  stdio: 'inherit',
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
