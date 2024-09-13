import { cp, readdir } from 'fs/promises'
import { join, resolve } from 'path'
import { packagesRoot, root } from './utils/locations.js'

async function main() {
  const iconsDir = join(packagesRoot, 'ui', 'src', 'icons')

  const files = (await readdir(iconsDir)) //
    .filter((file) => file.endsWith('.ts'))
    .filter((file) => file !== 'index.ts')
    .filter((file) => file !== 'IconNames.ts')

  // some local folder, should be removed later
  const srcDir = resolve(join(root, '..', 'mds-js', 'packages', 'mds-js-300', 'dist', 'N25', '24px'))

  for (const file of files) {
    const srcFile = join(srcDir, file.replace(/\.ts$/, '.js'))
    const targetFile = join(iconsDir, file)

    console.info(`${file}`)
    await cp(srcFile, targetFile, { force: true })
  }
}

main()
