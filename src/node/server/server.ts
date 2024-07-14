import type { IncomingMessage, ServerResponse } from 'http'
import { createServer } from 'http'
import net from 'net'
import { readFileSync } from 'fs'
import { resolve as resolvePath } from 'path'
import { handleRequest } from './handler'
import { createLogger } from '../logger'
import * as process from 'node:process'
import { handleSelf } from './self-handler'
import { defineSocketServer, sendWsData } from './websocket'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest } from '../utils/proxy-request'
import { displayServerInfo } from './server-info'

const DEFAULT_HOST = 'localhost'
const DEFAULT_PORT = 8080

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
  const serverAddress = new URL(`http://${host}:${port}`)

  function preHandleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.url?.startsWith('/')) {
      //const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`)
      return handleSelf(req, res)
    }
    return handleRequest(req, res)
  }

  return new Promise<URL>((resolve, reject) => {
    const options = {
      key: readFileSync(resolvePath(process.cwd(), 'cert/key.pem')).toString(),
      cert: readFileSync(
        resolvePath(process.cwd(), 'cert/cert.pem')
      ).toString(),
    }
    const server = createServer()
    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        logger.info(`Port ${port} is in use, trying another one...`)
        server.listen(++port, host)
      } else {
        console.log({ e })

        //server.removeListener('error', onError)
        //reject(e)
      }
    }

    server.addListener('connect', function (req, socket, head) {
      const [url, port] = req.url!.split(':') as [string, string]

      //console.log({ con: req.url, head: req.socket })

      // log the request
      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      //creating TCP connection to remote server
      const conn = net.connect(parseInt(port) || 443, url, function () {
        // tell the client that the connection is established
        socket.write(
          'HTTP/' + req.httpVersion + ' 200 OK\r\n\r\n',
          undefined,
          function () {
            // creating pipes in both ends
            conn.pipe(socket)
            socket.pipe(conn)
          }
        )

        socket.on('error', (err) => {
          console.log('socket error', { err })
        })
      })

      conn.on('connectionAttempt', (a, v, c) => {
        //console.log("connectionAttempt", {a, v, c})
      })

      conn.on('data', function (chunk) {
        //console.log({chunk: chunk.toString()})
      })

      conn.on('error', function (e) {
        console.log('Server connection error: ' + e)
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
      console.error('Server client error: ' + err)
    })

    defineSocketServer(server)

    server.addListener('request', preHandleRequest)
  })
}
