import type { ProxyRequest } from '../../server/ProxyRequest'

/**
 * Sets `content-length` to '0' if request method is DELETE.
 */
export const handleDelete = (req: ProxyRequest) => {
  if (req.method === 'DELETE' && !req.headers['content-length']) {
    req.headers['content-length'] = '0'
  }
}
