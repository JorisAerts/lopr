import { getCachedData } from '../../server/cache'
import type { UUID } from 'lopr-shared'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { ServerOptions } from '../../server'
import type { UrlWithParsedQuery } from 'url'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse, options: ServerOptions) => {
  if (url.pathname !== '/api/data' || !url.query.uuid) return false
  getCachedData(options, `${url.query.uuid}` as UUID)
    .then((data) => {
      res.setHeader('Content-Length', data.length)
      res.end(data)
    })
    .catch((err) => {
      res.statusCode = 404
      res.write(err).toString()
    })
  return true
}