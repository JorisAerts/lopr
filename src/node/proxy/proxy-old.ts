// proxy.ts
import * as http from 'http'
import * as https from 'https'
import * as net from 'net'
import forge from 'node-forge'

// Function to create a self-signed certificate
function createCertificate() {
  const pki = forge.pki
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()

  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  /*
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: '' },
    { shortName: 'ST', value: '' },
    { name: 'localityName', value: '' },
    { name: 'organizationName', value: '' },
    { shortName: 'OU', value: '' },
  ]
  */

  const attrs = [
    { name: 'commonName', value: 'Joriss-MacBook-Pro.local' },
    //{ shortName: 'CA', value: 'JorisAerts.com' },
    { name: 'countryName', value: 'BE' },
    { shortName: 'ST', value: 'OVL' },
    { name: 'localityName', value: 'Graviton' },
    //{ name: 'organizationName', value: '' },
    { shortName: 'OU', value: 'localhost' },
  ]

  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'subjectKeyIdentifier',
    },
  ])

  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  cert.sign(keys.privateKey, forge.md.sha256.create())

  const pem_pkey = pki.privateKeyToPem(keys.privateKey)
  const pem_cert = pki.certificateToPem(cert)

  return { key: pem_pkey, cert: pem_cert }
}

/**
 * Spin up the proxy server
 */
export const start = (
  options: {
    port?: number
    host?: string
  } = {}
) => {
  // Generate a self-signed certificate
  const { key, cert } = createCertificate()

  // HTTP Proxy Server
  http
    .createServer((req, res) => {
      console.log('HTTP Request:', req.url)

      const options = {
        hostname: req.headers.host,
        port: 80,
        path: req.url,
        method: req.method,
        headers: req.headers,
      }

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode!, proxyRes.headers)
        proxyRes.pipe(res, {
          end: true,
        })
      })

      req.pipe(proxyReq, {
        end: true,
      })

      proxyReq.on('error', (err) => {
        console.error('HTTP Proxy Error:', err)
        res.writeHead(500)
        res.end('Internal Server Error')
      })
    })
    .listen(8080, () => {
      console.log('HTTP proxy server is listening on port 8080')
    })

  // HTTPS Proxy Server
  https
    .createServer(
      { key, cert, allowHalfOpen: true, rejectUnauthorized: false },
      (req, res) => {
        console.log('HTTPS Request:', req.url)

        const options = {
          hostname: req.headers.host,
          port: 443,
          path: req.url,
          method: req.method,
          headers: req.headers,
        }

        const proxyReq = https.request({ ...options }, (proxyRes) => {
          res.writeHead(proxyRes.statusCode!, proxyRes.headers)
          proxyRes.pipe(res, {
            end: true,
          })
        })

        req.pipe(proxyReq, {
          end: true,
        })

        proxyReq.on('error', (err) => {
          console.error('HTTPS Proxy Error:', err)
          res.writeHead(500)
          res.end('Internal Server Error')
        })
      }
    )
    .listen(8443, () => {
      console.log('HTTPS proxy server is listening on port 8443')
    })

  // Handle HTTPS CONNECT requests
  const proxyServer = http.createServer()

  proxyServer.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = new URL(`http://${req.url}`)

    console.log('HTTPS CONNECT:', req.url)

    const serverSocket = net.connect(parseInt(port || '443'), hostname, () => {
      clientSocket.write(
        'HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: Node.js-Proxy\r\n' +
          '\r\n'
      )
      serverSocket.write(head)
      serverSocket.pipe(clientSocket)
      clientSocket.pipe(serverSocket)
    })

    serverSocket.on('error', (err) => {
      console.error('HTTPS CONNECT Error:', err)
      clientSocket.write(
        'HTTP/1.1 500 Internal Server Error\r\n' +
          'Proxy-agent: Node.js-Proxy\r\n' +
          '\r\n'
      )
      clientSocket.end()
    })
  })

  proxyServer.listen(8081, () => {
    console.log('HTTPS CONNECT proxy server is listening on port 8081')
  })

  return Promise.resolve('http://localhost:8080')
}
