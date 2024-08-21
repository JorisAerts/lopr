import type { UUID } from '../../shared/UUID'
import type { ServerOptions } from './ServerOptions'
import { cacheDir } from '../utils/temp-dir'
import { join } from 'path'
import { existsSync, rmSync, statSync } from 'fs'
import { access, constants, readFile } from 'fs/promises'
import type { ProxyRequestInfo } from '../../shared/Request'
import type { ProxyResponseInfo } from '../../shared/Response'
import * as fs from 'node:fs'

export const useCache = (options: ServerOptions) => {
  /**
   * Contains all ids (chronologically sequential)
   */
  const uuids = [] as UUID[]
  /**
   * The request data sent from the client.
   * All requests are tagged with a unique UUID
   */
  const requests = new Map<string, ProxyRequestInfo>()
  /**
   * A map of response data to the client, mapped to the UUID of the request
   */
  const responses = new Map<string, ProxyResponseInfo>()

  const getIds = (): UUID[] => uuids

  const clear = () => {
    //
  }

  const getCacheFile = (uuid: UUID) => {
    const tmpCacheDir = cacheDir(options)
    const file = join(tmpCacheDir, uuid)
    return access(file, constants.R_OK).then(() => file) //
  }

  const getResponseData = (uuid: UUID) =>
    getCacheFile(uuid) //
      .then((file) => readFile(file))

  return {
    getIds,
    getCacheFile,
    getResponseData,

    get cacheDir() {
      return cacheDir(options)
    },
  }
}

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
