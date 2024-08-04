// proxy.ts
import * as http from 'http'
import * as https from 'https'
import * as url from 'url'
import * as net from 'net'
import {
  createCertForHost,
  readRootCert,
  rootCert,
  rootKey,
} from '../certUtils'
import * as tls from 'node:tls'

const HTTP_PORT = 8080
const HTTPS_PORT = 8443

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

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

  const customAgent = new https.Agent({
    ca: readRootCert(),
  })

  // HTTPS Proxy Server
  const httpsServer = https.createServer(
    {
      //enableTrace: true,
      key: rootKey,
      cert: rootCert,
      //ca: readRootCert(),

      requestCert: true,
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
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
        agent: customAgent,
      }

      const proxyReq = https.request({ ...options }, (proxyRes) => {
        console.log('pipe', { res })
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

    const serverOptions: tls.ConnectionOptions = {
      key: key,
      cert: cert,

      //enableTrace: true,

      //port: port ? parseInt(port) : 443,
      //ca: rootCert,

      requestCert: true,
      rejectUnauthorized: false,

      SNICallback: (servername, cb) => {
        const certObj = createCertForHost(servername)
        console.log({ sni: servername, certObj, cb })
        cb(
          null,
          tls.createSecureContext({
            key: certObj.key,
            cert: certObj.cert,
            //ca: rootCert,
          })
        )
      },
    }

    clientSocket.on('error', (err) => {
      console.log('client error: ', err)
    })
    const proxySocket = net.connect(HTTPS_PORT, 'localhost', () => {
      clientSocket.write(
        'HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node.js-Proxy\r\n' +
          '\r\n'
      )

      const secureSocket = tls.connect(
        {
          socket: proxySocket,
          servername: hostname,
          ...serverOptions,
          //strictSSL: false,
          //ciphers: 'DEFAULT@SECLEVEL=0',
        },
        () => {
          //console.log({ secureSocket })
          if (secureSocket.authorized) {
            console.log('Connection authorized by a Certificate Authority.')
          } else {
            console.log(
              `Connection not authorized: ${secureSocket.authorizationError}`
            )
          }
        }
      )

      secureSocket.on('error', (err) => {
        console.log('Secure error: ', err)
      })

      secureSocket.write(head)
      secureSocket.pipe(clientSocket)

      clientSocket.pipe(secureSocket)
    })

    proxySocket.on('error', (err) => {
      console.error('Proxy socket error:', err)
      clientSocket.end()
    })
  })

  return Promise.resolve('http://localhost:8080')
}
