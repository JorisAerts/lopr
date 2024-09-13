import { readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const dirSize = async (dir: string, recursive = true): Promise<number> => {
  if (!existsSync(dir)) return 0
  const entries = await readdir(dir, { withFileTypes: true })
  const paths = entries.map(async (entry) => {
    const path = join(dir, entry.name)
    if (recursive && entry.isDirectory()) return await dirSize(path)
    if (entry.isFile()) {
      try {
        const { size } = await stat(path)
        return size
      } catch {
        // noop
      }
    }
    return 0
  })
  return (await Promise.all(paths)).reduce((i, size) => i + size, 0)
}
