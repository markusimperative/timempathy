import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { readFile, readdir, realpath, writeFile } from 'node:fs/promises'

const root = JSON.parse(await readFile('package.json', 'utf8'))
const visited = new Set()
const notices = []

async function visit(name, from = resolve('package.json')) {
  const require = createRequire(from)
  let packagePath
  try {
    packagePath = require.resolve(name + '/package.json')
  } catch {
    // Packages with an exports map may hide package.json. Walk from their entry.
    let folder = dirname(require.resolve(name))
    while (true) {
      try {
        const candidate = join(folder, 'package.json')
        const metadata = JSON.parse(await readFile(candidate, 'utf8'))
        if (metadata.name === name) {
          packagePath = candidate
          break
        }
      } catch {
        /* Try the parent of the resolved entry. */
      }
      const parent = dirname(folder)
      if (parent === folder) throw Error('Cannot locate package metadata: ' + name)
      folder = parent
    }
  }
  packagePath = await realpath(packagePath)
  if (visited.has(packagePath)) return
  visited.add(packagePath)
  const folder = dirname(packagePath)
  const metadata = JSON.parse(await readFile(packagePath, 'utf8'))
  const files = (await readdir(folder)).filter((file) =>
    /^(licen[sc]e|copying|notice|ofl)(\.|$)/i.test(file),
  )
  if (!files.length) throw Error('License notice missing for ' + name)
  const texts = await Promise.all(files.map((file) => readFile(join(folder, file), 'utf8')))
  notices.push(
    name +
      '@' +
      metadata.version +
      '\nLicense: ' +
      metadata.license +
      '\n\n' +
      texts.map((text) => text.replaceAll('\r\n', '\n').trimEnd()).join('\n\n'),
  )
  for (const child of Object.keys(metadata.dependencies ?? {})) await visit(child, packagePath)
}

for (const name of Object.keys(root.dependencies)) await visit(name)
await writeFile(
  'public/third-party-notices.txt',
  'Timempathy — runtime dependency notices\nGenerated from the locked installed packages.\n\n' +
    notices.sort().join('\n\n' + '='.repeat(72) + '\n\n') +
    '\n',
)
console.log('Preserved license notices for ' + notices.length + ' runtime packages.')
