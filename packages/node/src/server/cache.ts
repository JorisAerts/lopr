import type { ProxyRequestHistory, ProxyRequestInfo, ProxyResponseInfo, ProxyState, UseCache, UUID } from 'lopr-shared'
import { WebSocketMessageType } from 'lopr-shared'
import type { ProxyPortOptions, ServerOptions } from './ServerOptions'
import { cacheDir } from '../utils/temp-dir'
import { join } from 'path'
import { existsSync, rmSync, statSync } from 'fs'
import { access, readFile } from 'fs/promises'
import * as fs from 'node:fs'
import { sendWsData } from '../local'

export const useCache = (): UseCache => {
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

export const getCachedData = async (options: ServerOptions, uuid: UUID) => {
  const cache = cacheDir(options)
  const path = join(cache, uuid)
  if (!existsSync(cache) || !statSync(path, { throwIfNoEntry: false })?.isFile()) return ''
  await access(path, fs.constants.R_OK)
  return await readFile(path)
}

export const clearCache = (options: ProxyPortOptions) => {
  const cache = cacheDir(options)
  if (!existsSync(cache) || !statSync(cache, { throwIfNoEntry: false })?.isDirectory()) return
  rmSync(cache, { recursive: true, force: true })
}
