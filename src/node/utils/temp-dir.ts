import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { packageJson } from './package'
import type { ServerOptions } from './Options'

const tmp = join(os.tmpdir(), `${packageJson.name!}`)
if (!existsSync(tmp)) mkdirSync(tmp, { recursive: true })

/**
 * a getter function, which will create the temp-folder upon first access
 */
export const tempDir = () => tmp

export const cacheDir = (options: ServerOptions) => tmp
