import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import * as net from 'net'
import type { AddressInfo } from 'ws'
import { incoming } from './incoming'
import { wsIncoming } from './ws-incoming'
import type { OutgoingOptions } from './utils'
import type { Logger } from '../logger'
import { createLogger } from '../logger'
import { createCertForHost, getRootCert } from '../utils/cert-utils'
import { defineSocketServer, sendWsData } from '../server/websocket'
import { generatePac } from '../server/pac'
import { handleSelf } from '../server/self-handler'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest } from '../utils/proxy-request'
import { isLocalhost } from '../utils/is-localhost'

export interface CreateProxyOptions {
  port: number
  mapHttpsReg: boolean | undefined | string | RegExp
  map:
    | ((
        options: OutgoingOptions,
        req: IncomingMessage,
        res: ServerResponse | null
      ) => OutgoingOptions)
    | undefined
}

export interface CommonOptions {
  logger: Logger
}

export function createProxy<Options extends Partial<CreateProxyOptions>>(
  opt = {} as Options
) {
  const options = {
    port: 8080,
    mapHttpsReg: true,
    ...opt,
    logger: createLogger(),
  } as CreateProxyOptions & CommonOptions & Options

  const { logger } = options

  return new Promise((resolve, reject) => {
    // one host on https Server
    const pkiPromises = {} as Record<string, Promise<void>>
    let httpPort = options.port
    let httpsPort: number

    const generatePKI = (host: string) =>
      (pkiPromises[host] = new Promise((resolve) => {
        const cert = createCertForHost(host)
        //logger.debug('add context for: %s', host)
        httpsServer.addContext(host, cert)
        resolve()
      }))

    const httpsServer = https //
      .createServer(getRootCert(), forwardHttp)
      .listen(() => {
        httpsPort = (httpsServer.address() as AddressInfo).port
        //logger.debug('listening https on: %s', httpsPort)
      })

    const httpServer = http.createServer(forwardHttp)

    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        logger.info(`Port ${httpPort} is in use, trying another one...`)
        httpServer.listen(++httpPort)
      } else {
        logger.error({ e })
        httpServer.removeListener('error', onError)
      }
    }

    function onListening() {
      const address = `http://localhost:${httpPort}`
      defineSocketServer({ logger, server: httpServer })
      resolve({
        logger,
        address,
        url: new URL(address),
        server: httpServer,
      })
    }

    httpServer.on('error', onError)
    httpServer.on('listening', onListening)

    httpServer.listen(httpPort)

    function forwardHttp(req: IncomingMessage, res: ServerResponse) {
      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      if (isLocalhost(req, httpPort)) {
        // intercept local requests
        if (req.url === '/pac') {
          const pac = generatePac(`localhost:${httpPort}`)
          res.setHeader('content-type', 'text/javascript')
          res.end(pac)
        }

        // requests to this server (proxy UI)
        else {
          //console.log({ req })
          handleSelf(req, res)
        }

        return
      }

      // forward the request to the proxy
      return forward(req, res)
    }

    function forward(req: IncomingMessage, res: ServerResponse) {
      incoming(req, res, options as CreateProxyOptions)
    }

    // en.wikipedia.org/wiki/HTTP_tunnel
    httpServer.on('connect', function (req, socket) {
      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      //logger.debug('connect %s', req.url)
      if (req.url?.match(/:443$/)) {
        const host = req.url.substring(0, req.url.length - 4)
        if (
          options.mapHttpsReg === true ||
          (options.mapHttpsReg && host.match(options.mapHttpsReg))
        ) {
          const promise = pkiPromises[host] ?? generatePKI(host)
          promise.then(function () {
            const mediator = net.connect(httpsPort)
            mediator.on('connect', () => {
              //logger.debug('connected %s', req.url)
              socket.write('HTTP/1.1 200 Connection established\r\n\r\n')
            })
            socket.pipe(mediator).pipe(socket)
          })
        } else {
          const mediator = net //
            .connect(443, host)
            .on('connect', () =>
              socket.write('HTTP/1.1 200 Connection established\r\n\r\n')
            )
          socket.pipe(mediator).pipe(socket)
        }
      }
    })

    function upgrade(req: IncomingMessage, socket: net.Socket, head: Buffer) {
      /*
      logger.debug(
        'upgrade: %s',
        (isReqHttps(req) ? `https://${req.headers.host}` : '') + req.url
      )
      */
      sendWsData(WebSocketMessageType.ProxyRequest, createProxyRequest(req))

      // ignore local ws request (don't forward to the proxy)
      if (!isLocalhost(req, httpPort))
        wsIncoming(req, socket, options as CreateProxyOptions, httpServer, head)
    }

    httpServer.on('upgrade', upgrade)
  })
}
