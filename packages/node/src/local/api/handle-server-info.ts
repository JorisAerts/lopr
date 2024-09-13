import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { ServerOptions } from '../../server'
import type { UrlWithParsedQuery } from 'url'
import { dirSize } from '../../utils/fs'
import { certificatesDir } from '../../utils/cert-utils'
import { cacheDir } from '../../utils/temp-dir'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  if (url.pathname !== '/api/server-info') return false

  Promise.all([dirSize(certificatesDir()), dirSize(cacheDir(options))])
    .then(([certSize, cacheSize]) => {
      const data = JSON.stringify({ certSize, cacheSize })
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Length', data.length)
      res.end(data)
    })
    .catch((err) => {
      res.statusCode = 500
      res.write(err?.toString() ?? '')
      res.end()
    })

  return true
}
