import type { IncomingMessage } from 'http'
import { identity } from './identity'
import * as decompress from './decompress'

export const getIncomingMessageData = (res: IncomingMessage) =>
  new Promise((resolve, reject) => {
    const buffer: number[] = []
    res.on('data', (d: Buffer) => buffer.push(...d))
    res.on('end', () => resolve(Buffer.from(buffer)))
  }) as Promise<Uint8Array>

const RX_COMMA = /\s*,\s*/
const decompressKeys = Object.keys(decompress)
/**
 * Returns a `(buffer:Buffer) => Promise<Buffer>` that decodes the incoming compressed data
 */
export const decodeIncomingMessageData = (
  res: IncomingMessage
):
  | ((a: Uint8Array) => Uint8Array)
  | ((a: Uint8Array) => Promise<Uint8Array>) => {
  const encoding = res.headers['content-encoding']
    ?.toLowerCase()
    .split(RX_COMMA)
  return encoding?.every((key) => decompressKeys.includes(key))
    ? encoding.reduce(
        (a, b) => {
          const next: (a: Uint8Array) => Promise<Uint8Array> =
            decompress[b as keyof typeof decompress] ?? identity
          return (buffer: Uint8Array) => a(buffer).then(next)
        },
        (buffer: Uint8Array) => Promise.resolve(buffer)
      )
    : identity
}

export const getDecodedIncomingMessageData = (res: IncomingMessage) =>
  getIncomingMessageData(res).then(decodeIncomingMessageData(res))
