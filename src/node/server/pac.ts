/**
 * Generates the contents of the PAC-file
 *
 * @see https://en.wikipedia.org/wiki/Proxy_auto-config
 */
export const generatePac = (proxy: string) =>
  `
function FindProxyForURL(url, host) {
  if (
    url.substring(0, 4) === 'http' ||
    url.substring(0, 3) === 'ws:'  ||
    url.substring(0, 4) === 'wss:'
  ) {
    return 'PROXY ${proxy}'
  }
  return 'DIRECT'
}`.trim()
