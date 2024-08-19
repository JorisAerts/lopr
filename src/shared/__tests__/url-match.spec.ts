import { describe, expect, test } from 'vitest'
import { isMatch } from '../url-match'

describe('url-match', () => {
  test(`isMatch - protocol`, () => {
    // http
    expect(isMatch('http://www.example.com', { protocol: 'http' })).toBe(true)
    expect(isMatch('http://www.example.com', { protocol: 'https' })).toBe(false)
    // https
    expect(isMatch('https://www.example.com', { protocol: 'https' })).toBe(true)
    expect(isMatch('https://www.example.com', { protocol: 'http' })).toBe(false)
    // ws
    expect(isMatch('ws://localhost:8080', { protocol: 'ws' })).toBe(true)
    expect(isMatch('ws://localhost:8080', { protocol: 'wss' })).toBe(false)
    // wss
    expect(isMatch('wss://localhost:8080', { protocol: 'ws' })).toBe(false)
    expect(isMatch('wss://localhost:8080', { protocol: 'wss' })).toBe(true)
    //
    expect(isMatch('wss://localhost:8080', { protocol: '*' })).toBe(true)
    expect(isMatch('https://www.example.com', { protocol: '*' })).toBe(true)
  })

  test(`isMatch - domain`, () => {
    expect(isMatch('http://www.example.com', { domain: 'www.example.com' })).toBe(true)
    expect(isMatch('http://www.example.com', { domain: 'www.example.be' })).toBe(false)
    expect(isMatch('http://www.example.com', { domain: 'about.example.com' })).toBe(false)

    expect(isMatch('http://www.example.com', { domain: 'example.*' })).toBe(false)
    expect(isMatch('http://www.example.com', { domain: '*.example.*' })).toBe(true)

    expect(isMatch('http://www.example.com', { domain: '*.example.c?m' })).toBe(true)
    expect(isMatch('http://www.example.com', { domain: '*.example.o?g' })).toBe(false)
  })

  test(`isMatch - port`, () => {
    expect(isMatch('http://www.example.com', { port: 80 })).toBe(true)
    expect(isMatch('https://www.example.com', { port: 80 })).toBe(false)
    expect(isMatch('http://www.example.com', { port: '80' })).toBe(true)

    expect(isMatch('https://www.example.com', { port: 443 })).toBe(true)
    expect(isMatch('http://www.example.com', { port: 443 })).toBe(false)
    expect(isMatch('https://www.example.com', { port: '443' })).toBe(true)

    expect(isMatch('https://www.example.com:8080', { port: 443 })).toBe(false)
    expect(isMatch('https://www.example.com:8080', { port: 8080 })).toBe(true)

    expect(isMatch('https://www.example.com:8080', { port: 443 })).toBe(false)

    // doesn't work (yet)
    // expect(isMatch('www.example.com:8080', { port: 8080 })).toBe(true)
  })

  test(`isMatch - parameters`, () => {
    expect(isMatch('http://www.example.com?test=ok', { query: '*' })).toBe(true)
    expect(isMatch('http://www.example.com?test=ok', { query: 'test=*' })).toBe(true)
    expect(isMatch('http://www.example.com?test=ok', { query: 'test=?' })).toBe(false)
    // multiple parameters
    expect(isMatch('http://www.example.com?test=ok&test2=not-ok', { query: 'test=*' })).toBe(true)
    expect(isMatch('http://www.example.com?test=ok&test2=not-ok', { query: 'test=?' })).toBe(false)
    expect(isMatch('http://www.example.com?test=ok&test2=1', { query: 'test=?' })).toBe(false)
    expect(isMatch('http://www.example.com?test=ok&test2=1', { query: 'test=*' })).toBe(true)

    expect(isMatch('http://www.example.com?test=ok&test2=1', { query: 'test2=*' })).toBe(true)
    expect(isMatch('http://www.example.com?test=ok&test2=1', { query: 'test2=?' })).toBe(true)
  })

  test(`combined isMatch`, () => {
    expect(isMatch('http://www.example.com', { protocol: 'http', domain: 'example.*' })).toBe(false)
    expect(isMatch('http://www.example.com', { protocol: 'https', domain: '*.example.*' })).toBe(false)
    expect(isMatch('http://www.example.com', { protocol: 'http', domain: '*.example.*' })).toBe(true)
  })
})
