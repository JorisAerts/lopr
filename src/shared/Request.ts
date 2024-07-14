interface RawRequest {
  // provide an ID to tie multiple requests together
  id?: string
  url: string
  headers: string[]
  trailers?: string[]
  body?: string
  method: string | undefined
  statusCode: number | undefined
  contentLength: number
  ts: Date
}

export interface ProxyRequest extends RawRequest {
  //
}
