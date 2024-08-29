import type { Unique } from './UUID'
import type { Timestamped } from './Timestamped'

interface RawRequest extends Unique, Timestamped {
  // provide an ID to tie multiple requests together
  url: string
  urlNormal: string
  headers: string[]
  trailers?: string[]
  body?: string
  method: string | undefined
  statusCode: number | undefined
  contentLength: number
  paused: boolean
}

export interface ProxyRequestInfo extends RawRequest {}
