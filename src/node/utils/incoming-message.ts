import type { IncomingMessage } from 'http'
import { identity } from './identity'
import * as decompress from './decompress'
import { splitCsv } from './string-utils'

export const getIncomingMessageData = (res: IncomingMessage) =>
  new Promise((resolve) => {
    const buffer: number[] = []
    res.on('data', (d: Buffer) => buffer.push(...d))
    res.on('end', () => resolve(Buffer.from(buffer)))
  }) as Promise<Uint8Array>

// regex used for splitting the values
export type Decompressor = keyof typeof decompress
const decompressors = Object.keys(decompress) as Decompressor[]

/**
 * Returns a `(buffer:Buffer): Promise<Buffer>` that decodes the incoming compressed data,
 * which may be a sequence of compressions.
 */
export const decodeIncomingMessageData = (res: IncomingMessage): ((a: Uint8Array) => Uint8Array) | ((a: Uint8Array) => Promise<Uint8Array>) => {
  const encoding: Decompressor[] = splitCsv(res.headers['content-encoding']?.toLowerCase())
  return encoding.length && encoding.every((key) => decompressors.includes(key))
    ? encoding.reduce(
        (a, b) => {
          const next: (a: Uint8Array) => Promise<Uint8Array> = decompress[b]
          return (buffer: Uint8Array) => a(buffer).then(next)
        },
        (buffer: Uint8Array) => Promise.resolve(buffer)
      )
    : identity
}

export const getDecodedIncomingMessageData = (res: IncomingMessage) => getIncomingMessageData(res).then(decodeIncomingMessageData(res))
