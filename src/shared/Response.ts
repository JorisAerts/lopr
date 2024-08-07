import type { Unique } from './UUID'
import type { Timestamped } from './Timestamped'

interface RawResponse extends Unique, Timestamped {
  headers: string[]
  body: unknown
  contentLength: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProxyResponseInfo extends RawResponse {}
