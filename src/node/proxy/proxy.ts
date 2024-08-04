import type { IncomingMessage, ServerResponse } from 'http'
import * as http from 'http'
import * as https from 'https'
import * as net from 'net'
import incoming from './incoming'
import wsIncoming from './ws-incoming'
import { getPKI, getRootPKI } from './pki'
import type * as tls from 'node:tls'
import type { HttpServer } from 'vite'
import type { AddressInfo } from 'ws'

interface CreateProxyOptions {
  port: number
  mapHttpsReg: boolean | string | RegExp
}

export function createProxy(option: CreateProxyOptions) {
  // one host on https Server
  const pkiPromises = {} as Record<string, Promise<void>>
  let httpsPort: number

  function generatePKI(host: string) {
    pkiPromises[host] = new Promise((resolve) => {
      getPKI(host, function (option: tls.SecureContextOptions) {
        //debug('add context for: %s', host);
        httpsServer.addContext(host, option)
        resolve(undefined)
      })
    })
  }

  const httpsServer = https
    .createServer(
      {
        key: getRootPKI().key,
        cert: getRootPKI().cert,
      },
      forward
    )
    .listen(function (this: HttpServer) {
      httpsPort = (this.address() as AddressInfo).port
      //debug('listening https on: %s', httpsPort);
    })

  const httpServer = http
    .createServer(forward)
    .listen(option.port, function () {
      //debug('listening http on: %s', httpServer.address().port);
    })

  function forward(req: IncomingMessage, res: ServerResponse) {
    //debug('fetch: %s', (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
    incoming.forEach((come) => come(req, res, option))
  }

  // en.wikipedia.org/wiki/HTTP_tunnel
  httpServer.on('connect', function (req, socket) {
    //debug('connect %s', req.url);
    if (req.url?.match(/:443$/)) {
      const host = req.url.substring(0, req.url.length - 4)
      if (
        option.mapHttpsReg === true ||
        (option.mapHttpsReg !== false && host.match(option.mapHttpsReg))
      ) {
        let promise
        if (!(promise = pkiPromises[host])) {
          generatePKI(host)
          promise = pkiPromises[host]
        }
        promise.then(function () {
          const mediator = net.connect(httpsPort)
          mediator.on('connect', function () {
            //debug('connected %s', req.url);
            socket.write('HTTP/1.1 200 Connection established\r\n\r\n')
          })
          socket.pipe(mediator).pipe(socket)
        })
      } else {
        const mediator = net.connect(443, host)
        mediator.on('connect', function () {
          socket.write('HTTP/1.1 200 Connection established\r\n\r\n')
        })
        socket.pipe(mediator).pipe(socket)
      }
    }
  })

  function upgrade(req: IncomingMessage, socket: net.Socket, head: Buffer) {
    //debug('upgrade: %s', (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
    wsIncoming.forEach(function (come) {
      come(req, socket, option, httpServer, head)
    })
  }

  httpServer.on('upgrade', upgrade)
}
