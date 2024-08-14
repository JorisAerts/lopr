import type { IncomingMessage, Server, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import * as net from 'net'
import type { AddressInfo } from 'ws'
import { incoming } from './incoming'
import { wsIncoming } from './ws-incoming'
import type { OutgoingOptions } from './utils'
import type { Logger } from '../utils/logger'
import { createLogger } from '../utils/logger'
import { createCertForHost, getRootCert } from '../utils/cert-utils'
import { defineSocketServer, sendWsData } from './websocket'
import { generatePac } from './pac'
import { handleSelf } from './self-handler'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { isLocalhost } from '../utils/is-localhost'
import { ProxyRequest } from './ProxyRequest'
import { ProxyResponse } from './ProxyResponse'
import { createErrorMessage, createProxyRequest } from '../utils/ws-messages'
import { createErrorHandler } from '../../client/utils/logging'
import { tempDir } from '../utils/temp-dir'
import { join } from 'path'
import { captureResponse } from '../utils/captureResponse'

export interface CreateProxyOptions {
  port: number
  mapHttpsReg: boolean | undefined | string | RegExp
  map: ((options: OutgoingOptions, req: IncomingMessage, res: ServerResponse | null) => OutgoingOptions) | undefined
}

export interface CommonOptions {
  logger: Logger
}

const defaultServerOptions = {
  IncomingMessage: ProxyRequest satisfies typeof IncomingMessage,
  ServerResponse: ProxyResponse satisfies typeof ServerResponse<ProxyRequest>,
} as http.ServerOptions<typeof ProxyRequest, typeof ServerResponse>

type InternalOptions<Options extends Partial<CreateProxyOptions>> = CreateProxyOptions & CommonOptions & Options

export interface CreateProxy {
  address: string
  url: URL
  server: Server
  logger: Logger
}

export function createProxy<Options extends Partial<CreateProxyOptions>>(opt = {} as Options): Promise<CreateProxy> {
  const options = {
    port: 8080,
    mapHttpsReg: true,
    ...opt,
    logger: createLogger(),
  } as InternalOptions<Options>

  const { logger } = options

  return new Promise((resolve) => {
    // one host on https Server
    const pkiPromises = {} as Record<string, Promise<void>>
    let httpPort = options.port
    let httpsPort: number

    const generateCertificate = (host: string) =>
      (pkiPromises[host] ??= new Promise((resolve) => {
        const cert = createCertForHost(host)
        httpsServer.addContext(host, cert)

        sendWsData(WebSocketMessageType.Certificate, join(tempDir(), 'cert', 'generated', `${host}.crt`))

        resolve()
      }))

    // HTTPS-tunnel (let Node choose the port)
    const httpsServer = https //
      .createServer({ ...getRootCert(), ...defaultServerOptions }, forwardRequest as http.RequestListener<typeof ProxyRequest, typeof ServerResponse>)
      .listen(() => (httpsPort = (httpsServer.address() as AddressInfo).port))
    httpsServer.on('error', createErrorHandler(httpsServer))

    // HTTP Server (the actual proxy)
    const httpServer = http //
      .createServer(defaultServerOptions, forwardRequest as http.RequestListener<typeof ProxyRequest, typeof ServerResponse>)

    // try the next port if the suggested one is unavailable (8080... 8081... 8082...)
    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        logger.info(`Port ${httpPort} is in use, trying another one...`)
        httpServer.listen(++httpPort)
      } else {
        sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
        httpServer.removeListener('error', onError)
      }
    }

    httpServer.on('error', onError)
    httpServer.on('listening', () => {
      const address = `http://localhost:${httpPort}`
      defineSocketServer({ logger, server: httpServer })
      resolve({
        logger,
        address,
        url: new URL(address),
        server: httpServer,
      })
    })

    httpServer.listen(httpPort)

    function forwardRequest(req: ProxyRequest, res: ProxyResponse) {
      req.on('error', createErrorHandler(req))
      res.on('error', createErrorHandler(res))

      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      // requests to the local webserver (the GUI or PAC)
      if (isLocalhost(req, httpPort)) {
        // capture the output and send it to the websocket
        res = captureResponse(res)

        // intercept local requests
        if (req.url === '/pac') {
          const pac = generatePac(`localhost:${httpPort}`)
          res.setHeader('Content-Type', 'application/javascript')
          res.end(pac)
          return
        }

        // requests to this server (proxy UI)
        else {
          handleSelf(req, res)
        }
        return
      }

      // forward the request to the proxy
      return incoming(req, res, options as CreateProxyOptions)
    }

    httpServer.on('connect', function (req, socket) {
      req.on('error', createErrorHandler(req))
      socket.on('error', createErrorHandler(socket))

      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      if (req.url?.match(/:443$/)) {
        const host = req.url.substring(0, req.url.length - 4)
        if (options.mapHttpsReg === true || (options.mapHttpsReg && host.match(options.mapHttpsReg))) {
          const promise = pkiPromises[host] ?? generateCertificate(host)
          promise.then(function () {
            const mediator = net.connect(httpsPort)
            mediator.on('connect', () => socket.write('HTTP/1.1 200 Connection established\r\n\r\n'))
            mediator.on('error', createErrorHandler(mediator))
            socket.pipe(mediator).pipe(socket)
          })
        } else {
          const mediator = net.connect(443, host)
          mediator.on('connect', () => socket.write('HTTP/1.1 200 Connection established\r\n\r\n'))
          mediator.on('error', createErrorHandler(mediator))
          socket.pipe(mediator).pipe(socket)
        }
      }
    })

    // Websockets
    function upgrade(req: ProxyRequest, socket: net.Socket, head: Buffer) {
      req.on('error', createErrorHandler(req))
      socket.on('error', createErrorHandler(socket))

      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      // ignore local ws request (don't forward to the proxy)
      if (!isLocalhost(req, httpPort)) wsIncoming(req, socket, options as CreateProxyOptions, httpServer, head)
    }

    httpServer.on('upgrade', upgrade)
  })
}
