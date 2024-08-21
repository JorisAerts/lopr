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

  const addRequest = (info: ProxyRequestInfo) => {
    uuids.add(info.uuid)
    requests.set(info.uuid, info)
    sendWsData(WebSocketMessageType.ProxyRequest, info)
  }

  const addResponse = (info: ProxyResponseInfo) => {
    uuids.add(info.uuid)
    responses.set(info.uuid, info)
    sendWsData(WebSocketMessageType.ProxyResponse, info)
  }

  return {
    addRequest,
    addResponse,
    clear,
    get state() {
      return [...uuids].reduce(
        (ret, b) => {
          ret[b] = { request: requests.get(b), response: responses.get(b) }
          return ret
        },
        {} as Record<string, any>
      )
    },
  }
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