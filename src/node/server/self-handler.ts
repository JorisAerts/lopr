import type { IncomingMessage, ServerResponse } from 'http'
import { packageRoot } from '../utils/package'
import path, { resolve } from 'path'
import { readFileSync, statSync } from 'fs'
import { getContentType } from './content-type'

const staticRoot = resolve(packageRoot, 'dist', 'client')

const getStaticCandidates = (req: IncomingMessage) => [
  path.resolve(`${staticRoot}/${req.url}`),
  path.resolve(`${staticRoot}/${req.url}index.html`),
]

const isStaticMatch = (file: string) => {
  try {
    return statSync(file, { throwIfNoEntry: false })?.isFile()
  } catch {
    return false
  }
}

export const handleSelf = (req: IncomingMessage, res: ServerResponse) => {
  try {
    let file = getStaticCandidates(req).find(isStaticMatch)

    if (!file) {
      // handle404(req, res)
      file = path.resolve(`${staticRoot}/index.html`)
    }

    const data = `${readFileSync(file)}`
    const contentType = getContentType(file)

    //res.writeHead(200)
    if (contentType) res.setHeader('Content-Type', contentType)
    res.end(data)
  } catch (e) {
    console.error(e)
  }
}
