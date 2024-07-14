import path from 'path'

const typeMap = {
  '.html': 'text/html',
  '.css': 'text/css',

  '.js': 'text/javascript',
  '.json': 'text/json',

  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',

  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
}

export const getContentType = (file: string) =>
  typeMap[path.extname(file) as keyof typeof typeMap]
