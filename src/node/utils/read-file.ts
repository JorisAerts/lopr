import { readFileSync } from 'fs'
import { resolve as resolvePath } from 'path'
import process from 'node:process'

export const readFile = (path: string) => {
  const file = resolvePath(
    process.cwd() + (path.startsWith('/') ? '' : '/') + path
  )
  return readFileSync(file)
}
