// proxy.ts
import * as http from 'http'
import * as https from 'https'
import * as url from 'url'
import * as net from 'net'
import { createCertForHost, rootCert, rootKey } from './certUtils'

const HTTP_PORT = 8080
const HTTPS_PORT = 8443

export const start = () => {
  // HTTP Proxy Server
  const httpServer = http.createServer((req, res) => {
    console.log('HTTP Request:', req.url)

    const targetUrl = url.parse(req.url!)
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || 80,
      path: targetUrl.path,
      method: req.method,
      headers: req.headers,
    }

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode!, proxyRes.headers)
      proxyRes.pipe(res, { end: true })
    })

    req.pipe(proxyReq, { end: true })
    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err)
      res.writeHead(500)
      res.end('Internal Server Error')
    })
  })

  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP proxy server is listening on port ${HTTP_PORT}`)
  })

  // HTTPS Proxy Server
  const httpsServer = https.createServer(
    {
      key: rootKey,
      cert: rootCert,
    },
    (req, res) => {
      console.log('HTTPS Request:', req.url)

      const targetUrl = url.parse(req.url!)
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || 443,
        path: targetUrl.path,
        method: req.method,
        headers: req.headers,
      }

      const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode!, proxyRes.headers)
        proxyRes.pipe(res, { end: true })
      })

      req.pipe(proxyReq, { end: true })
      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err)
        res.writeHead(500)
        res.end('Internal Server Error')
      })
    }
  )

  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS proxy server is listening on port ${HTTPS_PORT}`)
  })

  // HTTPS Interception for CONNECT method
  httpServer.on('connect', (req, clientSocket, head) => {
    console.log('HTTPS CONNECT:', req.url)
    const { port, hostname } = new url.URL(`http://${req.url}`)

    const { key, cert } = createCertForHost(hostname)

    const proxySocket = new net.Socket()
    // proxySocket.connect({ port: parseInt(port), host: 'localhost',  }, () => {
    proxySocket.connect(HTTPS_PORT, 'localhost', () => {
      clientSocket.write(
        'HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node.js-Proxy\r\n' +
          '\r\n'
      )

      proxySocket.write(head)
      proxySocket.pipe(clientSocket)
      clientSocket.pipe(proxySocket)
    })

    proxySocket.on('error', (err) => {
      console.error('Proxy socket error:', err)
      clientSocket.end()
    })
  })

  return Promise.resolve('http://localhost:8080')
}
