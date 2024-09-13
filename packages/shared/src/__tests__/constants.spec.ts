import { describe, expect, test } from 'vitest'
import nodePackageJson from '../../../node/package.json'
import type { PackageJson } from 'type-fest'
import { APP_NAME, APP_VERSION } from '../constants'

describe('constants', () => {
  const pkg = nodePackageJson as PackageJson

  test(`APP_NAME vs package.json`, () => {
    expect(APP_NAME).toBe(pkg.name)
  })

  test(`APP_VERSION vs package.json`, () => {
    expect(APP_VERSION).toBe(pkg.version)
  })
})
