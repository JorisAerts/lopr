import type { IncomingMessage, Server, ServerResponse } from 'http'
import * as http from 'http'
import type { Logger } from '../utils/logger'
import { clearScreen, createErrorHandler, createErrorHandlerFor, createLogger } from '../utils/logger'
import * as https from 'https'
import * as net from 'net'
import type { AddressInfo } from 'ws'
import { forwardRequest, forwardWebSocket } from '../proxy'
import { createCertForHost, getRootCert } from '../utils/cert-utils'
import { registerDataHandler } from '../local/websocket'
import { defineSocketServer, handleStatic, sendWsData } from '../local'
import { generatePAC } from '../PAC'
import type { ProxyState } from 'js-proxy-shared'
import { HTTP_HEADER_CONTENT_LENGTH, HTTP_HEADER_CONTENT_TYPE, WebSocketMessageType } from 'js-proxy-shared'
import { isLocalhost } from '../utils/is-localhost'
import { ProxyRequest } from './ProxyRequest'
import { ProxyResponse } from './ProxyResponse'
import { createErrorMessage, createProxyRequest } from '../utils/ws-messages'
import { tempDir } from '../utils/temp-dir'
import { join } from 'path'
import { captureResponse } from '../utils/captureResponse'
import process from 'node:process'
import { newLine } from '../proxy/socket/newline'
import type { CreateProxyOptions, ServerOptions } from './ServerOptions'
import { clearCache, useCache } from './cache'
import { handleApi } from '../local/api-handler'

export const DEFAULT_PORT = 8080

const defaultServerOptions = {
  IncomingMessage: ProxyRequest satisfies typeof IncomingMessage,
  ServerResponse: ProxyResponse satisfies typeof ServerResponse<ProxyRequest>,
} as http.ServerOptions<typeof ProxyRequest, typeof ServerResponse>

/**
 * The resulting type of the createProxyServer({...}) function
 */
export interface CreateProxyServer {
  address: string
  url: URL
  server: Server
  logger: Logger
}

export function createProxyServer<Options extends Partial<CreateProxyOptions>>(userConfig = {} as Options): Promise<CreateProxyServer> {
  // the options object
  const options = {
    port: DEFAULT_PORT,
    proxySSL: true,
    ...userConfig,

    cache: useCache(),
    logger: createLogger(),
  } as ServerOptions

  // internal state, such as cache, breakpoints, ...
  const state: ProxyState & { config: ServerOptions } = {
    config: options,
    recording: true,
    cache: useCache(),
    breakpoints: [],
  }

  const { logger } = options

  const exit = () => {
    clearCache(options)
    clearScreen()
    logger.info('bye.\n')
  }

  // make sure the system goes to sleep with a clear mind
  process.on('exit', exit)
  process.on('SIGINT', () => process.exit(process.exitCode))

  // handle preference-changes
  registerDataHandler(WebSocketMessageType.Preferences, ({ data }) => Object.assign(options, data))
  // handle state changes (recording, breakpoints, ...)
  registerDataHandler(WebSocketMessageType.State, ({ data }) => Object.assign(state, data))

  // this ginormous method returns a promise,
  // that — as mentioned below — will resolve once the server is up.
  return new Promise((resolve) => {
    // one host on https Server
    const hosts = new Set<string>()
    let httpsPort: number

    const generateCertificate = (host: string) => {
      if (hosts.has(host)) return
      const cert = createCertForHost(host)
      httpsServer.addContext(host, cert)
      sendWsData(WebSocketMessageType.Certificate, [join(tempDir(), 'cert', 'generated', `${host}.crt`)])
      hosts.add(host)
    }

    // HTTPS-tunnel (let Node choose the port)
    const httpsServer = https //
      .createServer({ ...getRootCert(), ...defaultServerOptions }, handleRequest as http.RequestListener<typeof ProxyRequest, typeof ServerResponse>)
      .listen(() => (httpsPort = (httpsServer.address() as AddressInfo).port))
    createErrorHandlerFor(httpsServer)

    // HTTP Server (the actual proxy)
    const httpServer = http //
      .createServer(defaultServerOptions, handleRequest as http.RequestListener<typeof ProxyRequest, typeof ServerResponse>)

    // try the next port if the suggested one is unavailable (8080... 8081... 8082...)
    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        logger.info(`Port ${options.port} is in use, trying another one...`)
        httpServer.listen(++options.port)
      } else {
        sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
        httpServer.removeListener('error', onError)
      }
    }

    httpServer.on('error', onError)

    // Once the server is up, the Promise that comes out of this parent function
    // will be resolved.
    // It will resolve with an object that contains the details of the server.
    httpServer.on('listening', () => {
      defineSocketServer({
        logger,
        server: httpServer,
        onConnect: () => sendWsData(WebSocketMessageType.Preferences, options),
        state,
      })
      const address = `http://localhost:${options.port}`
      resolve({ logger, address, url: new URL(address), server: httpServer })
    })

    // A good time to start listening
    httpServer.listen(options.port)

    // forward the requests to their ultimate destination, coming from both HTTP and HTTPS
    function handleRequest(req: ProxyRequest, res: ProxyResponse) {
      createErrorHandlerFor(req, res)
      options.cache.addRequest(createProxyRequest(req), state)

      // requests to the local webserver (the GUI or PAC)
      if (isLocalhost(req, options.port)) {
        // capture the output and send it to the websocket
        const resCaptured = captureResponse(res, options, state)

        // intercept local requests
        if (req.url === '/pac') {
          const pac = generatePAC(`localhost:${options.port}`)
          resCaptured.setHeader(HTTP_HEADER_CONTENT_LENGTH, pac.length)
          resCaptured.setHeader(HTTP_HEADER_CONTENT_TYPE, 'application/x-ns-proxy-autoconfig')
          resCaptured.end(pac)
          return
        }

        if (handleApi(req, resCaptured, options)) {
          return
        }
        // requests to this server (proxy UI)
        else handleStatic(req, resCaptured)

        // everything is handled, so get out of here
        return
      }

      // forward the request to the proxy
      return forwardRequest(req, res, options, state)
    }

    const getHttpsMediator = (host: string) => {
      if (options.proxySSL === true || (options.proxySSL && host.match(options.proxySSL))) {
        generateCertificate(host)
        return net.connect(httpsPort)
      }
      return net.connect(443, host)
    }

    // HTTPS calls, they will set up a tunnel using this request.
    // From then on, everything we see is encrypted.
    //
    // So we create a mediator, our own https server with spoofed SSL certificates,
    // so we can monitor the data again, before it's encrypted and decrypted at the other side.
    httpServer.on('connect', (req, socket) => {
      createErrorHandlerFor(req, socket)
      options.cache.addRequest(createProxyRequest(req), state)
      if (req.url?.match(/:443$/)) {
        const host = req.url.substring(0, req.url.length - 4)
        const mediator = getHttpsMediator(host)
        mediator.on('connect', () => {
          socket.write('HTTP/1.1 200 Connection established')
          newLine(socket)
          newLine(socket)
        })
        mediator.on('error', createErrorHandler(mediator))
        socket.pipe(mediator).pipe(socket)
      }
    })

    // WebSockets
    httpServer.on('upgrade', (req: ProxyRequest, socket: net.Socket, head: Buffer) => {
      createErrorHandlerFor(req, socket)
      options.cache.addRequest(createProxyRequest(req), state)
      // ignore local ws request (don't forward to the proxy (for now...))
      if (!isLocalhost(req, options.port)) forwardWebSocket(req, socket, options, httpServer, head)
    })
  })
}
