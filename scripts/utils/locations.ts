import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let __root = __dirname

const isRoot = (dir: string) => existsSync(join(dir, 'package.json')) && existsSync(join(dir, '.gitignore'))

const md = (dir: string) => {
  mkdirSync(dir, { recursive: true })
  return dir
}

while (!isRoot(__root)) {
  if (__root === '/') throw new Error('Could not determine root directory')
  __root = dirname(__root)
}

export const root = __root
export const packagesRoot = join(root, 'packages')

export const scriptsRoot = join(root, 'scripts')
export const buildRoot = md(join(root, 'node_modules', '.lopr'))
