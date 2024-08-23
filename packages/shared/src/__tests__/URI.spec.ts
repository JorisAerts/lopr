import { describe, expect, test } from 'vitest'
import { URI } from '../URI'

describe('URI', () => {
  const url1 = 'http://www.example.com'
  const url2 = 'https://example.com:8080'
  const url3 = 'sftp://Ùser:pwd@example.com:1234567890/^some~path/?test=TEST&bool&default=false'

  test(`URI - protocol`, () => {
    expect(URI.parse(url1).protocol).toBe('http')
    expect(URI.parse(url2).protocol).toBe('https')
    expect(URI.parse(url3).protocol).toBe('sftp')

    expect(URI.parse('http://www.example.com/').protocol).toBe('http')
    expect(URI.parse('https://www.example.com').protocol).toBe('https')

    expect(URI.parse('www.example.com').protocol).toBeUndefined()
    expect(URI.parse('www.example.com/').protocol).toBeUndefined()
    expect(URI.parse('www.example.com').toString()).toMatch('www.example.com')
    expect(URI.parse('www.example.com:8080').toString()).toMatch('www.example.com:8080')
    expect(URI.parse('www.example.com:8080/').toString()).toMatch('www.example.com:8080/')
  })

  test(`URI - domain`, () => {
    expect(URI.parse(url1).domain).toBe('www.example.com')
    expect(URI.parse(url2).domain).toBe('example.com')
    expect(URI.parse(url3).domain).toBe('example.com')

    expect(URI.parse('http://www.example.com').domain).toBe('www.example.com')
    expect(URI.parse('www.example.com/').domain).toBe('www.example.com')
    expect(URI.parse('www.example.com').domain).toBe('www.example.com')
    expect(URI.parse('www.example.com/test/test').domain).toBe('www.example.com')
    expect(URI.parse('example.com/test/test').domain).toBe('example.com')
    expect(URI.parse('https://example.com/test/test').domain).toBe('example.com')
    expect(URI.parse('https://a.b.c.d.e.d.g.h.i.j.k.l.m.n.o.p.q.u.r.s.t.u.v.w.x.y.z/test/test').domain).toBe('a.b.c.d.e.d.g.h.i.j.k.l.m.n.o.p.q.u.r.s.t.u.v.w.x.y.z')
  })

  test(`URI - username`, () => {
    expect(URI.parse(url1).username).toBeUndefined()
    expect(URI.parse(url2).username).toBeUndefined()
    expect(URI.parse(url3).username).toBe('Ùser')
  })

  test(`URI - password`, () => {
    expect(URI.parse(url1).password).toBeUndefined()
    expect(URI.parse(url2).password).toBeUndefined()
    expect(URI.parse(url3).password).toBe('pwd')
  })

  test(`URI - parameters`, () => {
    expect(URI.parse('http://www.example.com?test=ok').params).toMatchObject({ test: 'ok' })
    expect(URI.parse('http://www.example.com?test=ok&test2=not-ok').params).toMatchObject({ test: 'ok', test2: 'not-ok' })
    expect(URI.parse('http://www.example.com?test=ok&test2=%20%20').params).toMatchObject({ test: 'ok', test2: '  ' })
    expect(URI.parse('http://www.example.com?test%202=%20ok%20').params).toMatchObject({ 'test 2': ' ok ' })
  })

  test(`URI - query`, () => {
    expect(URI.parse('http://www.example.com?test=ok').query).toBe('test=ok')
    expect(URI.parse('http://www.example.com?test=ok&test2=not-ok').query).toBe('test=ok&test2=not-ok')
    expect(URI.parse('http://www.example.com?test%202=%20ok%20').query).toBe('test%202=%20ok%20')
  })
})
