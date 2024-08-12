import zlib from 'zlib'
import { decode as lzwDecode } from './lzw'

type ZLibMethods = {
  [K in keyof typeof zlib as (typeof zlib)[K] extends (...args: any[]) => any ? K : never]: (typeof zlib)[K]
}

type Decompress = ZLibMethods['gunzip']

const promise =
  (what: keyof ZLibMethods) =>
  (
    buffer: Uint8Array //
  ) =>
    new Promise((resolve, reject) => (zlib[what] as Decompress)(Buffer.from(buffer), (err, data) => (err ? reject(err) : resolve(data)))) as Promise<Buffer>

export const gzip = promise('gunzip')
export const deflate = promise('deflateRaw')
export const br = promise('brotliDecompress')
export const zstd = (buffer: Uint8Array) => {
  return import('@mongodb-js/zstd').then(({ decompress }) => decompress(Buffer.from(buffer)))
}

export const compress = (buffer: Uint8Array) =>
  new Promise((resolve, reject) => {
    try {
      resolve(lzwDecode(buffer))
    } catch (e: unknown) {
      reject(e)
    }
  })
