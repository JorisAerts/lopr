import * as process from 'node:process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { PackageJson } from 'type-fest'

const packageJsonFile = (process.env as any).npm_package_json

/**
 * parsed package.json
 */
export const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonFile).toString()) as PackageJson

/**
 * root directory
 */
export const packageRoot = path.dirname(packageJsonFile)

/**
 * current working directory
 */
export const cwd = process.cwd()
