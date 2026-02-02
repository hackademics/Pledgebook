import { cpSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = join(__dirname, '..')
const source = join(rootDir, '.output')
const target = join(rootDir, '.output/public')

console.log('Copying Cloudflare Pages worker and config files to public directory...')

try {
  const files = readdirSync(source)
  files.forEach((file) => {
    // Skip public folder itself, server folder (not needed for Pages), and nitro.json
    if (file === 'public' || file === 'server' || file === 'nitro.json') return

    const srcPath = join(source, file)
    const destPath = join(target, file)

    console.log(`Copying ${file}...`)
    cpSync(srcPath, destPath, { recursive: true })
  })
  console.log('Post-build copy complete. Ready to deploy .output/public')
} catch (e) {
  console.error('Error during post-build copy:', e)
  process.exit(1)
}
