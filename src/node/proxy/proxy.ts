/**
 * simple reverse http proxy
 * @author yiminghe@gmail.com
 */

import * as http from 'http'
import * as https from 'https'
import * as net from 'net'

import incoming from './incoming'
import wsIncoming from './ws-incoming'
import pki from './pki'

module.exports = {
  createServer: createProxy,
}

function createProxy(option) {
  // one host on https Server
  const pkiPromises = {}
  let httpsPort

  function generatePKI(host) {
    const defer = Q.defer()
    pkiPromises[host] = defer.promise
    pki.getPKI(host, function (option) {
      //debug('add context for: %s', host);
      httpsServer.addContext(host, option)
      defer.resolve()
    })
  }

  var httpsServer = https
    .createServer(
      {
        key: pki.getRootPKI().key,
        cert: pki.getRootPKI().cert,
      },
      forward
    )
    .listen(function () {
      httpsPort = this.address().port
      //debug('listening https on: %s', httpsPort);
    })

  const httpServer = http.createServer(forward).listen(option.port, function () {
    //debug('listening http on: %s', httpServer.address().port);
  })

  function forward(req, res) {
    //debug('fetch: %s', (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
    incoming.forEach(function (come) {
      come(req, res, option)
    })
  }

  // en.wikipedia.org/wiki/HTTP_tunnel
  httpServer.on('connect', function (req, socket) {
    //debug('connect %s', req.url);
    if (req.url.match(/:443$/)) {
      const host = req.url.substring(0, req.url.length - 4)
      if (option.mapHttpsReg === true || host.match(option.mapHttpsReg)) {
        let promise
        if ((promise = pkiPromises[host])) {
        } else {
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

  function upgrade(req, socket, head) {
    const server = this
    //debug('upgrade: %s', (utils.isReqHttps(req) ? 'https://' + req.headers.host + '' : '') + req.url);
    wsIncoming.forEach(function (come) {
      come(req, socket, option, server, head)
    })
  }

  httpServer.on('upgrade', upgrade)
}
