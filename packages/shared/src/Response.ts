import type { Unique } from './UUID'
import type { Timestamped } from './Timestamped'

interface RawResponse extends Unique, Timestamped {
  headers: string[]
  body: unknown
  contentLength: number | undefined
  paused: boolean
}

export interface ProxyResponseInfo extends RawResponse {}
