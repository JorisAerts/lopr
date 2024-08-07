import type { UUID } from './UUID'

interface RawResponse {
  uuid?: UUID
  headers: string[]
  body: unknown
  ts: Date

  // provide an ID to tie multiple requests together
  contentLength: number
}

export interface ProxyResponseInfo extends RawResponse {}
