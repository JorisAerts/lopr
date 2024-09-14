import path from 'path'
import {
  APPLICATION_JAVASCRIPT,
  APPLICATION_PDF,
  APPLICATION_RTF,
  APPLICATION_TYPESCRIPT,
  APPLICATION_XHTML_PLUS_XML,
  APPLICATION_XML,
  FONT_OTF,
  FONT_TTF,
  FONT_WOFF,
  FONT_WOFF2,
  IMAGE_APNG,
  IMAGE_AVIF,
  IMAGE_BMP,
  IMAGE_GIF,
  IMAGE_JPEG,
  IMAGE_PNG,
  IMAGE_SVG_PLUS_XML,
  IMAGE_TIFF,
  TEXT_CALENDAR,
  TEXT_CSS,
  TEXT_HTML,
  TEXT_JSON,
} from 'lopr-shared/mime-types'

const typeMap = {
  '.html': TEXT_HTML,
  '.xhtml': APPLICATION_XHTML_PLUS_XML,
  '.css': TEXT_CSS,
  '.xml': APPLICATION_XML,

  '.js': APPLICATION_JAVASCRIPT,
  '.jsx': APPLICATION_JAVASCRIPT,
  '.cjs': APPLICATION_JAVASCRIPT,
  '.mjs': APPLICATION_JAVASCRIPT,

  '.ts': APPLICATION_TYPESCRIPT,
  '.cts': APPLICATION_TYPESCRIPT,
  '.mts': APPLICATION_TYPESCRIPT,
  '.tsx': APPLICATION_TYPESCRIPT,

  '.json': TEXT_JSON,

  '.avif': IMAGE_AVIF,
  '.bmp': IMAGE_BMP,
  '.svg': IMAGE_SVG_PLUS_XML,
  '.apng': IMAGE_APNG,
  '.jpg': IMAGE_JPEG,
  '.jpeg': IMAGE_JPEG,
  '.png': IMAGE_PNG,
  '.gif': IMAGE_GIF,
  '.tif': IMAGE_TIFF,
  '.tiff': IMAGE_TIFF,

  '.otf': FONT_OTF,
  '.ttf': FONT_TTF,
  '.woff': FONT_WOFF,
  '.woff2': FONT_WOFF2,

  '.ics': TEXT_CALENDAR,
  '.pdf': APPLICATION_PDF,
  '.rtf': APPLICATION_RTF,
}

export const getContentType = (file: string) => typeMap[path.extname(file) as keyof typeof typeMap]
