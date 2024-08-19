import { describe, expect, test } from 'vitest'
import { URI } from '../URI'

describe('URI', () => {
  test(`URI - protocol`, () => {
    expect(URI.parse('http://www.example.com').protocol).toBe('http')
    expect(URI.parse('http://www.example.com/').protocol).toBe('http')
    expect(URI.parse('https://www.example.com').protocol).toBe('https')

    expect(URI.parse('www.example.com').protocol).toBeUndefined()
    expect(URI.parse('www.example.com/').protocol).toBeUndefined()
    expect(URI.parse('www.example.com').toString()).toMatch('www.example.com')
    expect(URI.parse('www.example.com:8080').toString()).toMatch('www.example.com:8080')
    expect(URI.parse('www.example.com:8080/').toString()).toMatch('www.example.com:8080/')
  })

  test(`URI - domain`, () => {
    expect(URI.parse('http://www.example.com').domain).toBe('www.example.com')
    expect(URI.parse('www.example.com/').domain).toBe('www.example.com')
    expect(URI.parse('www.example.com').domain).toBe('www.example.com')
    expect(URI.parse('www.example.com/test/test').domain).toBe('www.example.com')
  })
})
