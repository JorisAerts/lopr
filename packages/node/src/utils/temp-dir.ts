import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { packageJson } from './package'
import type { ProxyPortOptions } from '../server/ServerOptions'
import { readdir } from 'fs/promises'

const tmp = join(os.tmpdir(), `${packageJson.name!}`)
if (!existsSync(tmp)) mkdirSync(tmp, { recursive: true })

/**
 * a getter function, which will create the temp-folder upon first access
 */
export const tempDir = () => tmp

export const cacheDir = (options: ProxyPortOptions) => join(tempDir(), 'cache', `${options.port}`)

export const cacheDirs = async () => {
  const cacheRoot = join(tempDir(), 'cache')
  if (!existsSync(cacheRoot)) return []
  return (await readdir(cacheRoot, { withFileTypes: true })) //
    .filter((f) => f.isDirectory())
    .map((f) => join(cacheRoot, f.name))
}
