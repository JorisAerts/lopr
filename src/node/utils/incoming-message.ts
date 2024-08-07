import type { IncomingMessage } from 'http'
import { identity } from './identity'
import { brotli, deflate, gunzip } from './decompress'

export const getIncomingMessageData = (res: IncomingMessage) =>
  new Promise((resolve, reject) => {
    const buffer: number[] = []
    res.on('data', (d: Buffer) => buffer.push(...d))
    res.on('end', () => resolve(Buffer.from(buffer)))
  }) as Promise<Uint8Array>

export const decodeIncomingMessageData = (
  res: IncomingMessage
): ((a: Uint8Array) => Uint8Array | Promise<Uint8Array>) => {
  const encoding = res.headers['content-encoding']
  if (!encoding) return identity
  switch (encoding) {
    case 'gzip':
      return gunzip
    case 'deflate':
      return deflate
    case 'br':
      return brotli
  }
  return identity
}

export const getDecodedIncomingMessageData = (res: IncomingMessage) =>
  getIncomingMessageData(res).then(decodeIncomingMessageData(res))
