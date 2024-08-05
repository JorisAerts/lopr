import { mkdtempSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { packageJson } from './package'

let tmp: string

let t = () => {
  tmp = mkdtempSync(join(os.tmpdir(), `${packageJson.name!}-`))
  t = () => tmp
  return tmp
}

/**
 * a getter function, which will create the temp-folder upon first access
 */
export const tempDir = () => t()
