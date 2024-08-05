import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'node:http'

export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  console.log(`HTTP Request: ${req.method} ${req.url}`)

  // Options for the request to the target server
  const options = {
    hostname: req.headers.host,
    port: 80,
    path: req.url,
    method: req.method,
    headers: req.headers,
  }

  // Forward the request to the target server
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode!, proxyRes.headers)
    proxyRes.pipe(res)
  })

  // Handle errors
  proxyReq.on('error', (err) => {
    console.error('Error with proxy request:', err)
    res.writeHead(500)
    res.end('Error with proxy request')
  })

  req.pipe(proxyReq)
}
