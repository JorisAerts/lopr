import type { IncomingMessage } from 'http'
import { packageRoot } from '../utils/package'
import path, { resolve } from 'path'
import { existsSync, readFileSync, statSync } from 'fs'
import { getContentType } from './content-type'
import { sendWsData } from './websocket'
import { WebSocketMessageType } from 'js-proxy-shared/WebSocketMessage'
import { createErrorMessage } from '../utils/ws-messages'
import type { ProxyResponse } from '../server/ProxyResponse'
import type { ProxyRequest } from '../server/ProxyRequest'
import { HTTP_HEADER_CONTENT_TYPE } from 'js-proxy-shared/constants'

const staticRoot = resolve(packageRoot, 'dist', 'client')

const getStaticCandidates = (req: IncomingMessage) => [
  //
  path.resolve(`${staticRoot}/${req.url}`),
  path.resolve(`${staticRoot}/${req.url}index.html`),
]

const isStaticMatch = (file: string) => {
  try {
    return statSync(file, { throwIfNoEntry: false })?.isFile()
  } catch {
    return false
  }
}

export const handleStatic = (req: ProxyRequest, res: ProxyResponse) => {
  try {
    let file = getStaticCandidates(req).find(isStaticMatch)

    if (!file) {
      file = path.resolve(`${staticRoot}/index.html`)
      if (!existsSync(file)) {
        return res.end('ERROR: Unable to locate the root index.html file.')
      }
    }

    const data = `${readFileSync(file)}`
    const contentType = getContentType(file)

    //res.writeHead(200)
    if (contentType) res.setHeader(HTTP_HEADER_CONTENT_TYPE, contentType)
    res.end(data)
  } catch (e) {
    sendWsData(WebSocketMessageType.Error, createErrorMessage(e))
  }
}
