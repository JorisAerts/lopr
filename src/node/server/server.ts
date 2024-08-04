import type { IncomingMessage, ServerResponse } from 'http'
import { createServer } from 'https'
import { handleRequest } from './handler'
import { createLogger } from '../logger'
import { handleSelf } from './self-handler'
import { defineSocketServer, sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest } from '../utils/proxy-request'
import { displayServerInfo } from './server-info'
import { DEFAULT_HOST, DEFAULT_PORT } from '../../shared/constants'
import { readFile } from '../utils/read-file'
import * as net from 'node:net'

/**
 * Spin up the proxy server
 */
export const start = (
  options: {
    port?: number
    host?: string
  } = {}
) => {
  const serverOptions = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    logger: createLogger(),
    ...options,
  }
  const { host, logger } = serverOptions
  let { port } = serverOptions

  function preHandleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.url?.startsWith('/')) {
      //const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`)
      return handleSelf(req, res)
    }
    return handleRequest(req, res)
  }

  return new Promise<URL>((resolve, reject) => {
    const options = {
      key: readFile('cert/key.pem'),
      cert: readFile('cert/cert.pem'),
      insecureHTTPParser: true,
      rejectUnauthorized: false,
      requestCert: true,
    }
    const server = createServer({
      ...options,
    })

    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        logger.info(`Port ${port} is in use, trying another one...`)
        server.listen(++port, host)
      } else {
        logger.error({ e })
        server.removeListener('error', onError)
      }
    }

    server.addListener('connect', function (req, socket, head) {
      const [url, port] = req.url!.split(':') as [string, string]
      //logger.log({ con: req.url, head: req.socket })

      // log the request
      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      //creating TCP connection to remote server
      const conn = net.connect(
        {
          port: parseInt(port) || 443,
          host: url,

          //cert: readFile('/cert/cert.pem'),
          //key: readFile('/cert/key.pem'),
        },
        function () {
          // tell the client that the connection is established
          socket.write(
            `HTTP/${  req.httpVersion  } 200 OK\r\n\r\n`,
            undefined,
            function () {
              // creating pipes in both ends
              conn.write(head)
              conn.pipe(socket)
              socket.pipe(conn)
            }
          )
          socket.on('error', (err) => {
            // logger.info('socket error', { err })
          })
        }
      )

      conn.on('data', (data) => {
        //logger.log({ data: data.toString() })
      })

      conn.on('connectionAttempt', (a, v, c) => {
        //logger.info("connectionAttempt", {a, v, c})
      })

      conn.on('data', function (chunk) {
        //logger.log({chunk: chunk.toString()})
      })

      conn.on('error', function (e) {
        logger.error(`Server connection error: ${  e}`)
        socket.end()
      })
    })

    server.on('error', onError)

    server.listen(port, () => {
      const address = new URL(`http://${host}:${port}`)
      displayServerInfo({ logger, server })
      resolve(address)
    })

    server.on('clientError', (err) => {
      // logger.error('Server client error: ' + err)
    })

    defineSocketServer({ logger, server })

    server.addListener('request', preHandleRequest)
  })
}
