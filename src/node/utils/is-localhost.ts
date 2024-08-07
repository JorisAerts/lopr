import type { IncomingMessage } from 'http'

const RX_LOCALHOST = /localhost(:|$)/
export const isLocalhost = (req: IncomingMessage, port?: number) => RX_LOCALHOST.test(req.headers.host!) && (port === undefined || req.headers.host?.endsWith(`:${port}`))
