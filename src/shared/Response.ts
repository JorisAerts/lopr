import type { UUID } from './UUID'

interface RawResponse {
  uuid: UUID
  headers: string[]
  body: unknown
  ts: Date

  // provide an ID to tie multiple requests together
  contentLength: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProxyResponseInfo extends RawResponse {}
