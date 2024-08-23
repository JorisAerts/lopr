import type { UUID } from 'js-proxy-shared/UUID'
import type { ServerOptions } from './ServerOptions'
import { cacheDir } from '../utils/temp-dir'
import { join } from 'path'
import { existsSync, rmSync, statSync } from 'fs'
import { access, readFile } from 'fs/promises'
import type { ProxyRequestInfo } from 'js-proxy-shared/Request'
import type { ProxyResponseInfo } from 'js-proxy-shared/Response'
import * as fs from 'node:fs'
import { sendWsData } from '../local'
import { WebSocketMessageType } from 'js-proxy-shared/WebSocketMessage'
import type { ProxyRequestHistory } from 'js-proxy-shared/ProxyRequestHistory'
import type { ProxyState } from 'js-proxy-shared/ProxyState'

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

  const addRequest = (info: ProxyRequestInfo, state: ProxyState) => {
    if (!state.recording) return
    uuids.add(info.uuid)
    requests.set(info.uuid, info)
    sendWsData(WebSocketMessageType.ProxyRequest, info)
  }

  const addResponse = (info: ProxyResponseInfo, state: ProxyState) => {
    if (!state.recording) return
    uuids.add(info.uuid)
    responses.set(info.uuid, info)
    sendWsData(WebSocketMessageType.ProxyResponse, info)
  }

  return {
    addRequest,
    addResponse,
    clear,
    get state() {
      return [...uuids].reduce((ret, b) => {
        const request = requests.get(b)
        const response = responses.get(b)
        if (request || response) ret[b] = { request, response }
        return ret
      }, {} as ProxyRequestHistory)
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
