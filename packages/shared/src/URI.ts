export type URLParameters = Record<string, string | string[]>

// regexes used to parse an URL
const RX_PLUS = /\+/g
const RX_PROTOCOL = /^(\w+):(\/+)?/
const RX_CREDENTIALS = /^(.[^/@:]+)(:)?(.[^@/]+)?@/
const RX_DOMAIN_PORT = /([^:/]+)(:(\d+))*?(\/|$)/

const parseProtocol = (uri: URI, val: string) => {
  const match = val.match(RX_PROTOCOL)
  if (!match) return val
  uri.protocol = match[1]
  return val.substring(match[0].length)
}

const parseCredentials = (uri: URI, val: string) => {
  const match = val.match(RX_CREDENTIALS)
  if (!match) return val
  uri.username = match[1]
  uri.password = match[3]
  return val.substring(match[0].length)
}

const parseDomainAndPort = (uri: URI, val: string) => {
  const match = val.match(RX_DOMAIN_PORT)
  if (!match) return val
  uri.domain = match[1]
  if (match[3]) uri.port = parseInt(match[3])
  return val.substring(match[0].length)
}

const parseQueryString = (uri: URI, val: string) => {
  uri.params = {} as URLParameters
  const pos = val.indexOf('?')
  if (pos < 0) return val
  const query = val.substring(pos + 1)
  uri.params = parseParameters(query)
  return val.substring(0, val.length - query.length - 1)
}

const parseHash = (uri: URI, val: string) => {
  const pos = val.indexOf('#')
  if (pos < 0) return val
  uri.hash = val.substring(pos + 1)
  return val.substring(0, val.length - uri.hash.length - 1)
}

const parseParameters = (pp = ''): URLParameters =>
  pp.split('&').reduce(
    (ret, param) => {
      let [key, value] = param.split('=', 2)
      if (key) key = decodeURIComponent(key)
      if (value) value = decodeURIComponent(value.replace(RX_PLUS, ' '))
      if (ret[key] === undefined) ret[key] = value
      else if (Array.isArray(ret[key])) (ret[key] as string[]).push(value)
      else ret[key] = [ret[key] as string, value]
      return ret
    },
    Object.create(null) as URLParameters
  )

const serializeParam = (key: string, value: string | string[]) => {
  let ret = ''
  if (Array.isArray(value))
    for (const v in value) {
      ret += `${ret.length ? '&' : ''}${serializeParam(key, v)}`
    }
  else if (typeof value !== 'object') {
    ret += `${encodeURIComponent(key)}${value ? `=${encodeURIComponent(value)}` : ''}`
  }
  return ret
}

const serializeParams = (params: URLParameters) =>
  Object.entries(params) //
    .reduce((ret, [key, value]) => `${ret}${ret.length ? '&' : ''}${serializeParam(key, value)}`, '')

/**
 * Lax URL parsing.
 * It can handle URLs without a protocol and such.
 */
export class URI {
  //
  public protocol: string | undefined
  public domain: string | undefined
  public port: number | undefined
  public username: string | undefined
  public password: string | undefined
  public path: string | undefined
  public filename: string | undefined
  public params: URLParameters = {}
  public hash: string | undefined

  constructor(url: string | URL = '') {
    url = `${url}`
    url = parseHash(this, url)
    url = parseQueryString(this, url)
    url = parseProtocol(this, url)
    url = parseCredentials(this, url)
    url = parseDomainAndPort(this, url)
    this.path = url
    this.filename = this.path.substring(this.path.lastIndexOf('/') + 1)
  }

  public get hasParameters(): boolean {
    return Object.keys(this.params).length > 0
  }

  public get hasQuery(): boolean {
    return this.hasParameters
  }

  public get hasHash(): boolean {
    return !!this.hash
  }

  public get query() {
    return serializeParams(this.params).replace(/%20/g, '+')
  }

  public toString(withQuery = true, withHash = true) {
    let url = ''
    if (this.protocol) url += `${this.protocol}://`
    if (this.username) url += `${this.username}${this.password ? `:${this.password}` : ''}@`
    if (this.domain) url += `${this.domain}${this.port ? `:${this.port}` : ''}/`
    if (this.path) url += this.path
    if (withQuery && this.hasQuery) url += `?${this.query}`
    if (withHash && this.hasHash) url += `#${this.hash}`
    return url
  }

  public static parse(url: string) {
    return new URI(url)
  }

  public static canParse(url: string) {
    try {
      return !!URI.parse(url)
    } catch {
      return false
    }
  }
}
