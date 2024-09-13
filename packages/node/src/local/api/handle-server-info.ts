import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { UrlWithParsedQuery } from 'url'
import { basename } from 'path'
import { dirSize } from '../../utils/fs'
import { certificatesDir } from '../../utils/cert-utils'
import { cacheDirs } from '../../utils/temp-dir'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse) => {
  if (url.pathname !== '/api/server-info') return false

  getCacheSizes().then((sizes) =>
    Promise.all([dirSize(certificatesDir()), sizes])
      .then(([certSize, cacheSizes]) => {
        const data = JSON.stringify({ certSize, cacheSizes })
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Length', data.length)
        res.end(data)
      })
      .catch((err) => {
        res.statusCode = 500
        res.write(err?.toString() ?? '')
        res.end()
      })
  )

  return true
}

/**
 * Fetch the cache size for each cache-folder (per port)
 */
async function getCacheSizes() {
  const sizes = {} as Record<string, unknown>
  const dirs = await cacheDirs()
  for (const dir of dirs) {
    const port = basename(dir)
    sizes[port] = await dirSize(dir, true)
  }
  return sizes
}
