import type { UUID } from './UUID'

interface RawRequest {
  // provide an ID to tie multiple requests together
  uuid: UUID
  url: string
  headers: string[]
  trailers?: string[]
  body?: string
  method: string | undefined
  statusCode: number | undefined
  contentLength: number
  ts: Date
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProxyRequestInfo extends RawRequest {}
