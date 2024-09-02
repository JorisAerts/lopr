import * as process from 'node:process'
import * as fs from 'node:fs'
import type { PackageJson } from 'type-fest'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * root directory
 */
export const packageRoot = join(__dirname, '..') // only 1 up, because we'll be in "dist"

/**
 * parsed package.json
 */
export const packageJson: PackageJson = JSON.parse(fs.readFileSync(join(packageRoot, 'package.json')).toString()) as PackageJson

/**
 * current working directory
 */
export const cwd = process.cwd()
