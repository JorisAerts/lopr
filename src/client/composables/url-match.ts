import { URI } from '../../shared/URI'

type WildcardAsterix = '*'
type WildcardQuestion = '?'
type Wildcard = WildcardAsterix | WildcardQuestion

const RX_DOTS = /\./g
const RX_ASTERIX = /\*/g
const RX_QUESTIONMARK = /\?/g

export interface UrlMatch {
  scheme?: string | Wildcard
  protocol?: string | Wildcard
  domain?: string | Wildcard
  port?: string | number | Wildcard
  username?: string | Wildcard
  path?: string | Wildcard
  query?: string | Wildcard
}

const createRx = (val: string, begin = '^', end = '$') =>
  new RegExp(
    `${begin}${val //
      .replace(RX_DOTS, '\\.')
      .replace(RX_ASTERIX, '.*')
      .replace(RX_QUESTIONMARK, '.{1}')}${end}`
  )

export const isMatch = (a: URI | URL | string, b: UrlMatch, prop?: keyof URI | keyof UrlMatch): boolean => {
  const uri = a instanceof URI ? a : new URI(a)
  if (!uri.port) {
    if (uri.protocol === 'http') uri.port = 80
    if (uri.protocol === 'https') uri.port = 443
  }
  if (prop === undefined) {
    const keys = Object.keys(b) as (keyof URI)[]
    return !keys.length || keys.every((key) => isMatch(uri, b, key))
  }

  switch (prop) {
    // don't verify passwords
    case 'password':

    // scheme isn't part of the url
    // eslint-disable-next-line no-fallthrough
    case 'scheme':
      return true

    // check against the query-string instead
    case 'parameters':
      return isMatch(uri, b, 'query')
    case 'query': {
      const matchVal = b.query as string
      if (matchVal === '*') return true
      return createRx(matchVal, '(^|&)', '($|&)').test(uri.query)
    }

    default: {
      const matchVal = `${b[prop as keyof UrlMatch]}`
      if (!matchVal) return true
      if (matchVal?.trim() === '*') return true
      return createRx(matchVal).test(uri[prop] as string)
    }
  }
}
