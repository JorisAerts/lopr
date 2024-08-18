export type URLParameters = Record<string, string | string[]>

// regexes used to parse an URL
const RX_PLUS = /\+/g
const RX_PROTOCOL = /^(\w+):(\/+)?/
const RX_CREDENTIALS = /^(.[^/@:]+)(:)?(.[^@/]+)?@/
const RX_DOMAIN_PORT = /([^:/]+)(:(\d+))*?(\/|$)/

const parseParameters = (pp = ''): URLParameters => {
  const ret = Object.create(null) as URLParameters
  const params = pp.split('&')
  if (params.length == 0) return ret
  for (const param of params) {
    const split = param.split('=', 2)
    const [key] = split
    let [, value] = split
    if (value) value = decodeURIComponent(value.replace(RX_PLUS, ' '))
    if (!ret[key]) {
      ret[key] = value
    } else if (typeof ret[key] === 'string') {
      ret[key] = [ret[key], value]
    } else {
      ;(ret[key] as string[]).push(value)
    }
  }
  return ret
}

const parseQueryString = (uri: URI, str: string) => {
  uri.parameters = {} as URLParameters
  const pos = str.indexOf('?')
  if (pos >= 0) {
    const parameters = str.substring(pos + 1)
    uri.parameters = parseParameters(parameters)
    return str.substring(0, str.length - parameters.length - 1)
  } else {
    return str
  }
}

const parseHash = (uri: URI, str: string) => {
  const pos = str.indexOf('#')
  if (pos >= 0) {
    uri.hash = str.substring(pos + 1)
    return str.substring(0, str.length - uri.hash.length - 1)
  } else {
    return str
  }
}

const serializeParam = (key: string, value: string | string[]) => {
  let ret = ''
  if (typeof value !== 'object') {
    ret += `${key}${value ? `=${encodeURIComponent(value)}` : ''}`
  } else if (Array.isArray(value)) {
    for (const v in value) {
      ret += `${ret.length ? '&' : ''}${serializeParam(key, v)}`
    }
  }
  return ret
}

export const serializeParams = (params: URLParameters) => {
  let ret = ''
  for (const [key, value] of Object.entries(params)) {
    ret += `${ret.length ? '&' : ''}${serializeParam(key, value)}`
  }
  return ret
}

const parseProtocol = (uri: URI, str: string) => {
  const match = str.match(RX_PROTOCOL)
  if (!match) return str
  uri.protocol = match[1]
  return str.substring(match[0].length)
}

const parseCredentials = (uri: URI, str: string) => {
  const match = str.match(RX_CREDENTIALS)
  if (!match) return str
  uri.username = match[1]
  uri.password = match[3]
  return str.substring(match[0].length)
}

const parseDomainAndPort = (uri: URI, str: string) => {
  const match = str.match(RX_DOMAIN_PORT)
  if (!(match && uri.protocol)) return str
  uri.domain = match[1]
  if (match[3]) {
    uri.port = parseInt(match[3])
  }
  return str.substring(match[0].length)
}

/**
 * Lax URL parsing
 */
export class URI {
  public protocol: string | undefined
  public domain: string | undefined
  public port: number | undefined
  public username: string | undefined
  public password: string | undefined
  public path: string | undefined
  public filename: string | undefined
  public parameters: URLParameters = {}
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

  public get query() {
    return serializeParams(this.parameters)
  }

  public toString(addParams = true, addHash = true) {
    let url = ''
    if (this.protocol) url += `${this.protocol}://`
    if (this.username) url += `${this.username}${this.password ? `:${this.password}` : ''}@`
    if (this.domain) url += `${this.domain}${this.port ? `:${this.port}` : ''}/`
    if (this.path) url += this.path
    if (addParams) {
      const params = this.query
      if (params !== '') url += `?${params}`
    }
    if (addHash && this.hash) url += `#${this.hash}`
    return url
  }

  public static current() {
    return new URI(`${window.location}`)
  }
}
