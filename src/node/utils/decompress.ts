import zlib from 'zlib'

type ZLibMethods = {
  [K in keyof typeof zlib as (typeof zlib)[K] extends (...args: any[]) => any ? K : never]: (typeof zlib)[K]
}

type Decompress = ZLibMethods['deflate']

const promise =
  (what: keyof ZLibMethods) =>
  (
    buffer: Uint8Array //
  ) =>
    new Promise((resolve, reject) => (zlib[what] as Decompress)(Buffer.from(buffer), (err, data) => (err ? reject(err) : resolve(data)))) as Promise<Buffer>

export const gzip = promise('gunzip')
export const deflate = promise('deflate')
export const brotli = promise('brotliDecompress')
export const zstd = (buffer: Uint8Array) => import('@mongodb-js/zstd').then(({ decompress }) => decompress(Buffer.from(buffer)))
