import { HTTP_HEADER_CONTENT_DISPOSITION, HTTP_HEADER_CONTENT_LENGTH, HTTP_HEADER_CONTENT_TYPE } from 'lopr-shared'
import type { ProxyRequest } from '../../server/ProxyRequest'
import type { ProxyResponse } from '../../server/ProxyResponse'
import type { UrlWithParsedQuery } from 'url'
import { certificatesDir, getRootKeyFiles } from '../../utils/cert-utils'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

export const handle = (url: UrlWithParsedQuery, req: ProxyRequest, res: ProxyResponse) => {
  if (url.pathname !== '/api/data' || !url.query.cert) return false
  const certFile = `${url.query.cert}.crt`
  const cert = url.query.cert === 'root' ? getRootKeyFiles().cert : join(certificatesDir(), certFile)
  if (!existsSync(cert)) {
    res.statusCode = 404
    res.write('Not Found').toString()
  } else {
    readFile(cert)
      .then((data) => {
        res.setHeader(HTTP_HEADER_CONTENT_LENGTH, data.length)
        res.setHeader(HTTP_HEADER_CONTENT_TYPE, 'application/x-x509-user-cert')
        res.setHeader(HTTP_HEADER_CONTENT_DISPOSITION, `attachment; filename="${certFile}"`)
        res.end(data)
      })
      .catch((err) => {
        res.statusCode = 500
        res.write(err?.toString() ?? '')
        res.end()
      })
  }
  return true
}
