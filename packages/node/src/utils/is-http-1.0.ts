import type { IncomingMessage } from 'http'

export const isHttp10 = (req: IncomingMessage) => req.httpVersion === '1.0'
