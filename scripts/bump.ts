import { readdir, readFile, writeFile } from 'fs/promises'
import { join, relative } from 'path'
import { packagesRoot, root } from './utils/locations.js'
import process from 'node:process'
import { existsSync } from 'fs'

const getOptions = () => {
  const args = process.argv.slice(2)
  const minor = args.includes('--minor')
  const major = args.includes('--major')
  return {
    minor,
    major,
    patch: !major && !minor,
  }
}

const getVersion = (packageJson: any) => {
  const { version } = packageJson
  const verionRaw = version.split(RX_VERSION_SPLIT, 3).map((i: string) => parseInt(i, 10))
  const subpart = version.substring(verionRaw.join('.').length).trim()
  const arr = subpart.length ? [...verionRaw, subpart] : verionRaw
  return {
    major: arr[0],
    minor: arr[1],
    patch: arr[2],
    subpart: subpart.length ? subpart : undefined,
    toString() {
      return `${this.major}.${this.minor}.${this.patch}${this.subpart ?? ''}`
    },
  }
}

const getPackageJsons = async () => {
  return (await readdir(packagesRoot, { recursive: false, withFileTypes: true })) //
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesRoot, entry.name, 'package.json'))
    .filter((file) => existsSync(file))
}

const RX_VERSION_SPLIT = /[\W]/

async function main() {
  const options = getOptions()
  const packageJson = JSON.parse((await readFile(join(root, 'package.json'))).toString())
  const version = getVersion(packageJson)
  const from = `${version}`

  if (options.major) {
    console.info('Bump major version')
    version.major++
    version.minor = 0
    version.patch = 0
  } else if (options.minor) {
    console.info('Bump minor version')
    version.minor++
    version.patch = 0
  } else {
    console.info('Bump patch version')
    version.patch++
  }

  console.info(`Bumped version from ${from} to ${version}`)

  console.info('Writing package jsons')
  const str = `${version}`
  for (const pkg of [...(await getPackageJsons()), join(root, 'package.json')]) {
    console.info(` > ${relative(root, pkg)}`)
    const data = await readFile(pkg)
    const json = JSON.parse(data.toString())
    json.version = str
    await writeFile(pkg, JSON.stringify(json, null, 2))
  }

  console.info(`Bump constants`)
  const RX_VERSION_REPLACE = /export const APP_VERSION = '([^']+)?'/
  const constantsFile = join(packagesRoot, 'shared', 'src', 'constants.ts')
  const data = await readFile(constantsFile)
  const newConstants = data.toString().replace(RX_VERSION_REPLACE, () => `export const APP_VERSION = '${str}'`)
  await writeFile(constantsFile, newConstants)
}

main()
