import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { UrlWithParsedQuery } from 'url'
import { basename } from 'path'
import { APPLICATION_JSON } from 'lopr-shared/mime-types'
import { HTTP_HEADER_CONTENT_LENGTH, HTTP_HEADER_CONTENT_TYPE } from 'lopr-shared'
import { dirSize } from '../../utils/fs'
import { certificatesDir } from '../../utils/cert-utils'
import { cacheDirs } from '../../utils/temp-dir'
import type { InternalProxyState } from '../../server/server-state'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, state: InternalProxyState) => {
  if (url.pathname !== '/api/server-info') return false

  getCacheSizes().then((sizes) =>
    Promise.all([dirSize(certificatesDir()), sizes])
      .then(([certSize, cacheSizes]) => {
        const data = JSON.stringify({
          port: state.config.port,
          sizes: { certSize, cacheSizes: undefined, ...cacheSizes },
        })
        res.setHeader(HTTP_HEADER_CONTENT_TYPE, APPLICATION_JSON)
        res.setHeader(HTTP_HEADER_CONTENT_LENGTH, data.length)
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
