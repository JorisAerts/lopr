import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import * as net from 'net'
import type { AddressInfo } from 'ws'
import { incoming } from './incoming'
import { wsIncoming } from './ws-incoming'
import type { OutgoingOptions } from './utils'
import { isReqHttps } from './utils'
import type { Logger } from '../logger'
import { createLogger } from '../logger'
import { createCertForHost, getRootCert } from '../utils/cert-utils'
import { defineSocketServer } from '../server/websocket'
import { generatePac } from '../server/pac'

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

  // one host on https Server
  const pkiPromises = {} as Record<string, Promise<void>>
  let httpsPort: number

  const generatePKI = (host: string) =>
    (pkiPromises[host] = new Promise((resolve) => {
      const cert = createCertForHost(host)
      logger.debug('add context for: %s', host)
      httpsServer.addContext(host, cert)
      resolve()
    }))

  const httpsServer = https
    .createServer(getRootCert(), forward) //
    .listen(() => {
      httpsPort = (httpsServer.address() as AddressInfo).port
      logger.debug('listening https on: %s', httpsPort)
    })

  const httpServer = http.createServer(forwardHttp).listen(options.port, () => {
    logger.debug(
      'listening http on: %s',
      (httpServer.address() as AddressInfo)?.port
    )
  })

  function forwardHttp(req: IncomingMessage, res: ServerResponse) {
    console.log({
      host: req.headers.host,
      url: req.url,
      same: req.headers.host === httpServer.address(),
    })

    // intercept local requests
    if (req.url === '/pac') {
      const pac = generatePac(`localhost:${options.port}`)
      res.setHeader('content-type', 'text/javascript')
      res.end(pac)
    }

    return forward(req, res)
  }

  function forward(req: IncomingMessage, res: ServerResponse) {
    /*
    logger.debug(
      'fetch: %s',
      (isReqHttps(req) ? `https://${req.headers.host}` : '') + req.url
    )
    */
    incoming(req, res, options as CreateProxyOptions)
  }

  // en.wikipedia.org/wiki/HTTP_tunnel
  httpServer.on('connect', function (req, socket) {
    logger.debug('connect %s', req.url)
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
            logger.debug('connected %s', req.url)
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
    logger.debug(
      'upgrade: %s',
      (isReqHttps(req) ? `https://${req.headers.host}` : '') + req.url
    )
    wsIncoming(req, socket, options as CreateProxyOptions, httpServer, head)
  }

  httpServer.on('upgrade', upgrade)

  defineSocketServer({ logger, server: httpServer })

  const address = `http://localhost:${options.port}`

  return Promise.resolve({
    logger,
    address,
    url: new URL(address),
    server: httpServer,
  })
}
