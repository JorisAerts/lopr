// proxy.ts
import * as http from 'http'
import * as https from 'https'
import forge from 'node-forge'
import * as fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const start = () => {
  // Generate a self-signed certificate for HTTPS
  const pki = forge.pki
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()

  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

  const attrs = [
    { name: 'commonName', value: 'Joriss-MacBook-Pro.local' },
    { name: 'countryName', value: 'BE' },
    { shortName: 'ST', value: 'OVL' },
    { name: 'localityName', value: 'Graviton' },
    //{ name: 'organizationName', value: '' },
    { shortName: 'OU', value: 'localhost' },
  ]

  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  cert.sign(keys.privateKey, forge.md.sha256.create())

  const pem_pkey = pki.privateKeyToPem(keys.privateKey)
  const pem_cert = pki.certificateToPem(cert)

  console.log(path.join(__dirname, 'cert.pem'))
  console.log(path.join(__dirname, 'key.pem'))

  fs.writeFileSync(path.join(__dirname, 'cert.pem'), pem_cert)
  fs.writeFileSync(path.join(__dirname, 'key.pem'), pem_pkey)

  const handleRequest = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    target: string
  ) => {
    const hn = new URL(req.url!)

    const options = {
      hostname: hn.hostname, //target,
      port: (req.connection as any).encrypted ? 443 : 80,
      path: req.url,
      method: req.method,
      headers: req.headers,
    }

    const protocol = (req.connection as any).encrypted ? https : http
    const proxyReq = protocol.request(options, (proxyRes) => {
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

  // HTTP Server
  http
    .createServer((req, res) => {
      console.log('HTTP Request:', req.url)
      handleRequest(req, res, 'localhost')
    })
    .listen(8080, () => {
      console.log('HTTP proxy server is listening on port 8080')
    })

  // HTTPS Server
  const httpsServer = https
    .createServer(
      {
        key: pem_pkey,
        cert: pem_cert,
      },
      (req, res) => {
        console.log('HTTPS Request:', req.url)
        handleRequest(req, res, 'localhost')
      }
    )
    .listen(8443, () => {
      console.log('HTTPS proxy server is listening on port 8443')
    })

  httpsServer.on('connect', (req: http.IncomingMessage) => {
    console.log('HTTPS:' + req.url)
  })

  httpsServer.on('request', (req: http.IncomingMessage) => {
    console.log('HTTPS:' + req.url)
  })

  return Promise.resolve('http://localhost:8080')
}
