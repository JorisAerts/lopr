import type { UUID } from '../../shared/UUID'
import type { ServerOptions } from './ServerOptions'
import { cacheDir } from '../utils/temp-dir'
import { join } from 'path'
import { existsSync, rmSync, statSync } from 'fs'
import { access, readFile } from 'fs/promises'
import type { ProxyRequestInfo } from '../../shared/Request'
import type { ProxyResponseInfo } from '../../shared/Response'
import * as fs from 'node:fs'
import { sendWsData } from '../local'
import { WebSocketMessageType } from '../../shared/WebSocketMessage'
import { createProxyRequest, createProxyResponse } from '../utils/ws-messages'
import type { ProxyRequest } from './ProxyRequest'
import type { IncomingMessage } from 'http'

export const useCache = () => {
  /**
   * Contains all ids (chronologically sequential)
   */
  const uuids = new Set<UUID>()
  /**
   * The request data sent from the client.
   * All requests are tagged with a unique UUID
   */
  const requests = new Map<string, ProxyRequestInfo>()
  /**
   * A map of response data to the client, mapped to the UUID of the request
   */
  const responses = new Map<string, ProxyResponseInfo>()

  /**
   * Clear cache
   */
  const clear = () => {
    uuids.clear()
    responses.clear()
    requests.clear()
    // TODO: clearCache(options)
  }

  const addRequest = (req: ProxyRequest) => {
    const info = createProxyRequest(req)
    uuids.add(req.uuid)
    requests.set(req.uuid, info)
    sendWsData(WebSocketMessageType.ProxyRequest, info)
  }

  const addResponse = (uuid: UUID, res: IncomingMessage, data: Buffer) => {
    const info = createProxyResponse(uuid, res, data)
    uuids.add(uuid)
    responses.set(uuid, info)
    sendWsData(WebSocketMessageType.ProxyResponse, info)
  }

  return { addRequest, addResponse, clear }
}

export type UseCache = ReturnType<typeof useCache>

export const getCachedData = (options: ServerOptions, uuid: UUID) => {
  const cache = cacheDir(options)
  const path = join(cache, uuid)
  if (!statSync(path, { throwIfNoEntry: false })!.isFile()) return Promise.resolve('')
  return access(path, fs.constants.R_OK).then(() => readFile(path))
}

export const clearCache = (options: ServerOptions) => {
  const cache = cacheDir(options)
  if (!existsSync(cache) || !statSync(cache).isDirectory()) return
  rmSync(cache, { recursive: true, force: true })
}
