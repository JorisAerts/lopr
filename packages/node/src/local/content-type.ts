import path from 'path'

const mime = {
  js: 'application/javascript',
  ts: 'application/typescript',
}

const typeMap = {
  '.html': 'text/html',
  '.css': 'text/css',

  '.js': mime.js,
  '.jsx': mime.js,
  '.cjs': mime.js,
  '.mjs': mime.js,

  '.ts': mime.ts,
  '.cts': mime.ts,
  '.mts': mime.ts,
  '.tsx': mime.ts,

  '.json': 'text/json',

  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',

  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export const getContentType = (file: string) => typeMap[path.extname(file) as keyof typeof typeMap]
