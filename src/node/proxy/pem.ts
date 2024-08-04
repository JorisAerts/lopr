/**
 * modified from https://github.com/andris9/pem
 */
import { spawn } from 'child_process'
import os from 'os'
import { join } from 'path'
import fs from 'fs'
import crypto from 'crypto'
import type {
  Certificate,
  CertificateFields,
  CertificateOptions,
  EmailAddress,
} from './Certificate'

const tempDir = os.tmpdir() || '/tmp'

// PUBLIC API

type CreatePrivateKeyCallback = ((err: Error, keyData?: undefined) => void) &
  ((err: null, keyData: { key: string }) => void)

/**
 * Creates a private key
 *
 * @param {Number} [keyBitSize=1024] Size of the key, defaults to 1024bit
 * @param {Function} callback Callback function with an error object and {key}
 */
export function createPrivateKey(callback: CreatePrivateKeyCallback): void
export function createPrivateKey(
  keyBitSize: number,
  callback: CreatePrivateKeyCallback
): void
export function createPrivateKey(
  keyBitSize: number | CreatePrivateKeyCallback | undefined,
  callback?: CreatePrivateKeyCallback
) {
  if (!callback && typeof keyBitSize == 'function') {
    callback = keyBitSize
    keyBitSize = undefined
  }

  keyBitSize = Number(keyBitSize) || 1024

  const params = ['genrsa', '-rand', '/var/log/system.log', `${keyBitSize}`]

  execOpenSSL(params, 'RSA PRIVATE KEY', (error, key) => {
    return error ? callback!(error) : callback!(null, { key: key! })
  })
}

export interface CreateCSROptions extends CertificateFields {
  clientKey: string
  keyBitSize: number
  hash: string
}

interface CreateCSRCallbackData {
  csr: string
  clientKey?: string
}

export type CreateCSRCallback = ((err: Error, keyData?: never) => void) &
  ((err: null, keyData: CreateCSRCallbackData) => void)

/**
 * Creates a Certificate Signing Request
 *
 * If client key is undefined, a new key is created automatically. The used key is included
 * in the callback return as clientKey
 *
 * @param {Function} callback Callback function with an error object and {csr, clientKey}
 */
//export function createCSR(options: CreateCSROptions, callback: any): void
//export function createCSR(callback: any): void
export function createCSR(
  options: Partial<CreateCSROptions> | undefined,
  callback: CreateCSRCallback
) {
  if (!callback && typeof options == 'function') {
    callback = options
    options = undefined
  }

  options ??= {}

  if (!options.clientKey) {
    createPrivateKey(options.keyBitSize || 1024, function (error, keyData) {
      if (error) {
        return callback(error)
      }
      options.clientKey = keyData!.key
      createCSR(options, callback)
    })
    return
  }

  const params = [
    'req',
    '-new',
    `-${options.hash || 'sha1'}`,
    '-subj',
    generateCSRSubject(options),
    '-key',
    '--TMPFILE--',
  ]

  execOpenSSL(
    params,
    'CERTIFICATE REQUEST',
    options.clientKey,
    function (error, data) {
      if (error) {
        return callback(error)
      }
      const response = {
        csr: data!,
        clientKey: options.clientKey,
      }
      return callback(null, response)
    }
  )
}

export interface CreateCertificateOptions {
  serviceKey: string
  selfSigned: boolean
  csr: string
  days: number

  commonName: string

  clientKey: string
  keyBitSize: number
  serviceCertificate: string
  serial: number
}

type CreateCertificateCallbackData = {
  certificate: string
  csr: string
  clientKey: string
  serviceKey: string
}

export type CreateCertificateCallback = ((
  err: Error,
  data?: undefined
) => void) &
  ((err: null, data: CreateCertificateCallbackData) => void)

/**
 * Creates a certificate based on a CSR. If CSR is not defined, a new one
 * will be generated automatically. For CSR generation all the options values
 * can be used as with createCSR.
 *
 * @param {Object} [options] Optional options object
 * @param {String} [options.serviceKey] Private key for signing the certificate, if not defined a new one is generated
 * @param {Boolean} [options.selfSigned] If set to true and serviceKey is not defined, use clientKey for signing
 * @param {String} [options.csr] CSR for the certificate, if not defined a new one is generated
 * @param {Number} [options.days] Certificate expire time in days
 * @param {Function} callback Callback function with an error object and {certificate, csr, clientKey, serviceKey}
 */
export function createCertificate(
  options: Partial<CreateCertificateOptions>,
  callback: CreateCertificateCallback
) {
  if (!callback && typeof options == 'function') {
    callback = options
    options = {}
  }

  if (!options.csr) {
    createCSR(options, function (error, keyData) {
      if (error) {
        return callback(error)
      }
      options.csr = keyData!.csr
      options.clientKey = keyData!.clientKey
      createCertificate(options, callback)
    })
    return
  }

  if (!options.serviceKey) {
    if (options.selfSigned) {
      options.serviceKey = options.clientKey
    } else {
      createPrivateKey(options.keyBitSize || 1024, function (error, keyData) {
        if (error) {
          return callback(error)
        }
        options.serviceKey = keyData!.key
        createCertificate(options, callback)
      })
      return
    }
  }

  const params = [
    'x509',
    '-req',
    '-days',
    `${Number(options.days) || 365}`,
    '-in',
    '--TMPFILE--',
  ]
  const tmpFiles = [options.csr]
  if (options.serviceCertificate) {
    if (!options.serial) {
      return callback(new Error('serial option required for CA signing'))
    }
    params.push('-CA')
    params.push('--TMPFILE--')
    params.push('-CAkey')
    params.push('--TMPFILE--')
    params.push('-set_serial')
    params.push(`0x${`00000000${options.serial.toString(16)}`.slice(-8)}`)
    tmpFiles.push(options.serviceCertificate)
  } else {
    params.push('-signkey')
    params.push('--TMPFILE--')
  }
  if (options.serviceKey) tmpFiles.push(options.serviceKey)

  execOpenSSL(params, 'CERTIFICATE', tmpFiles, function (error, data) {
    if (error) {
      return callback(error)
    }
    const response = {
      csr: options.csr!,
      clientKey: options.clientKey!,
      certificate: data!,
      serviceKey: options.serviceKey!,
    }
    return callback(null, response)
  })
}

export interface GetPublicKeyCallbackData {
  publicKey: string
}

export type GetPublicKeyCallback<Result> = ((
  err: Error,
  data?: never
) => Result) &
  ((err: null, data: GetPublicKeyCallbackData) => Result)

/**
 * Exports a public key from a private key, CSR or certificate
 *
 * @param {String} certificate PEM encoded private key, CSR or certificate
 * @param {Function} callback Callback function with an error object and {publicKey}
 */
export function getPublicKey<Result>(
  certificate: string,
  callback: GetPublicKeyCallback<Result>
) {
  if (!callback && typeof certificate == 'function') {
    callback = certificate
    certificate = ''
  }

  certificate = (certificate || '').toString()

  let params

  if (certificate.match(/BEGIN CERTIFICATE REQUEST/)) {
    params = ['req', '-in', '--TMPFILE--', '-pubkey', '-noout']
  } else if (certificate.match(/BEGIN RSA PRIVATE KEY/)) {
    params = ['rsa', '-in', '--TMPFILE--', '-pubout']
  } else {
    params = ['x509', '-in', '--TMPFILE--', '-pubkey', '-noout']
  }

  execOpenSSL(params, 'PUBLIC KEY', certificate, (error, key) =>
    error ? callback(error) : callback(null, { publicKey: key! })
  )
}

export type ReadCertificateInfoCallbackData = CertificateFields

export type ReadCertificateInfoCallback<Result> = ((
  err: Error,
  data?: never
) => Result) &
  ((err: null, data: ReadCertificateInfoCallbackData) => Result)

/**
 * Reads subject data from a certificate or a CSR
 *
 * @param {String} certificate PEM encoded CSR or certificate
 * @param {Function} callback Callback function with an error object and {country, state, locality, organization, organizationUnit, commonName, emailAddress}
 */
export function readCertificateInfo<Result>(
  certificate: string,
  callback: ReadCertificateInfoCallback<Result>
) {
  if (!callback && typeof certificate == 'function') {
    callback = certificate
    certificate = ''
  }

  certificate = (certificate || '').toString()

  const type = certificate.match(/BEGIN CERTIFICATE REQUEST/) ? 'req' : 'x509',
    params = [type, '-noout', '-text', '-in', '--TMPFILE--']
  spawnWrapper(params, certificate, (err, code, stdout) =>
    err ? callback(err) : fetchCertificateData(`${stdout}`, callback)
  )
}

export interface GetModulusCallbackData {
  modulus: string
}

export type GetModulusCallback<Result> = ((
  err: Error,
  data?: never
) => Result) &
  ((err: null, data: GetModulusCallbackData) => Result)

/**
 * get the modulus from a certificate, a CSR or a private key
 *
 * @param {String} certificate PEM encoded, CSR PEM encoded, or private key
 * @param {Function} callback Callback function with an error object and {modulus}
 */
export function getModulus<Result>(
  certificate: string,
  callback: GetModulusCallback<Result>
) {
  let type = ''
  if (certificate.match(/BEGIN CERTIFICATE REQUEST/)) {
    type = 'req'
  } else if (certificate.match(/BEGIN RSA PRIVATE KEY/)) {
    type = 'rsa'
  } else {
    type = 'x509'
  }
  const params = [type, '-noout', '-modulus', '-in', '--TMPFILE--']
  spawnWrapper(params, certificate, function (err, code, stdout) {
    if (err) {
      return callback(err)
    }
    const match = `${stdout}`.match(/Modulus=([0-9a-fA-F]+)$/m)
    if (match) {
      return callback(null, { modulus: match[1] })
    } else {
      return callback(new Error('No modulus'))
    }
  })
}

export interface FingerPrintData {
  fingerprint: string
}

export type GetFingerPrintCallback = ((err: Error) => void) &
  ((err: null, data: FingerPrintData) => void)

/**
 * Gets the fingerprint for a certificate
 *
 * @param {String} PEM encoded certificate
 * @param {Function} callback Callback function with an error object and {fingerprint}
 */
export function getFingerprint(
  certificate: string,
  callback: GetFingerPrintCallback
) {
  const params = ['x509', '-in', '--TMPFILE--', '-fingerprint', '-noout']

  spawnWrapper(params, certificate, function (err, code, stdout) {
    if (err) {
      return callback(err)
    }
    const match = `${stdout}`.match(/Fingerprint=([0-9a-fA-F:]+)$/m)
    return match
      ? callback(null, { fingerprint: match[1] })
      : callback(new Error('No fingerprint'))
  })
}

export interface Validity {
  start: number
  end: number
}

export interface FetchCertificateDataCallbackData extends CertificateOptions {
  validity: Validity
}

export type FetchCertificateDataCallback = ((err: Error) => void) &
  ((err: null, data: FetchCertificateDataCallbackData) => void)

// HELPER FUNCTIONS

function fetchCertificateData(
  certData: Buffer | string,
  callback: FetchCertificateDataCallback
) {
  const certDataStr = (certData || '').toString()

  let subject, extra, tmp
  const certValues = {} as FetchCertificateDataCallbackData
  const validity = {} as Validity

  if (
    (subject = certDataStr.match(/Subject:([^\n]*)\n/)) &&
    subject.length > 1
  ) {
    subject = subject[1]
    extra = subject.split('/')
    subject = `${extra.shift()}\n`
    extra = `${extra.join('/')}\n`

    // country
    tmp = subject.match(/\sC=([^,\n].*?)[,\n]/)
    certValues.country = (tmp && tmp[1]) || ''
    // state
    tmp = subject.match(/\sST=([^,\n].*?)[,\n]/)
    certValues.state = (tmp && tmp[1]) || ''
    // locality
    tmp = subject.match(/\sL=([^,\n].*?)[,\n]/)
    certValues.locality = (tmp && tmp[1]) || ''
    // organization
    tmp = subject.match(/\sO=([^,\n].*?)[,\n]/)
    certValues.organization = (tmp && tmp[1]) || ''
    // unit
    tmp = subject.match(/\sOU=([^,\n].*?)[,\n]/)
    certValues.organizationUnit = (tmp && tmp[1]) || ''
    // common name
    tmp = subject.match(/\sCN=([^,\n].*?)[,\n]/)
    certValues.commonName = (tmp && tmp[1]) || ''
    //email
    tmp = extra.match(/emailAddress=([^,\n/].*?)[,\n/]/)
    certValues.emailAddress = ((tmp && tmp[1]) as EmailAddress) || ''
  }
  if (
    (tmp = certDataStr.match(/Not Before\s?:\s?([^\n]*)\n/)) &&
    tmp.length > 1
  )
    validity.start = Date.parse((tmp && tmp[1]) || '')
  if ((tmp = certDataStr.match(/Not After\s?:\s?([^\n]*)\n/)) && tmp.length > 1)
    validity.end = Date.parse((tmp && tmp[1]) || '')
  if (validity.start && validity.end) certValues.validity = validity

  callback(null, certValues)
}

const RX_CSR = /[^\w .\-@]+/g

function generateCSRSubject(options: Partial<CertificateOptions>) {
  options = options || {}
  const csrData: Certificate = {
    C: options.country || options.C || '',
    ST: options.state || options.ST || '',
    L: options.locality || options.L || '',
    O: options.organization || options.O || '',
    OU: options.organizationUnit || options.OU || '',
    CN: options.commonName || options.CN || 'localhost',
    emailAddress: options.emailAddress || '',
  }
  const csrBuilder = [] as string[]

  Object.keys(csrData).forEach(function (key) {
    if (csrData[key as keyof Certificate]) {
      csrBuilder.push(
        `/${key}=${csrData[key as keyof Certificate].replace(RX_CSR, ' ').trim()}`
      )
    }
  })

  return csrBuilder.join('')
}

type SpawnOpenSSLCallback = (
  error: Error | null,
  exitCode: number,
  stdout: Buffer,
  stderr: Buffer
) => void

/**
 * Generically spawn openSSL, without processing the result
 *
 * @param {Array}        params   The parameters to pass to openssl
 * @param {String|Array} tmpFiles    Stuff to pass to tmpFiles
 * @param {Function}     callback Called with (error, exitCode, stdout, stderr)
 */
function spawnOpenSSL(params: string[], callback: SpawnOpenSSLCallback) {
  const openssl = spawn('openssl', params)
  let stdout = Buffer.alloc(0)
  let stderr = Buffer.alloc(0)

  openssl.stdout.on('data', function (data) {
    stdout = Buffer.concat([stdout, data])
  })

  openssl.stderr.on('data', function (data) {
    stderr = Buffer.concat([stderr, data])
  })

  // We need both the return code and access to all of stdout.  Stdout isn't
  // *really* available until the close event fires; the timing nuance was
  // making this fail periodically.
  let needed = 2 // wait for both exit and close.
  let code = -1
  const bothDone = function () {
    if (code) {
      callback(
        new Error(
          `Invalid openssl exit code: ${code}\n% openssl ${params.join(' ')}\n${
            stderr
          }`
        ),
        code,
        stdout,
        stderr
      )
    } else {
      callback(null, code, stdout, stderr)
    }
  }

  openssl.on('exit', function (ret) {
    code = ret ?? 0
    if (--needed < 1) {
      bothDone()
    }
  })

  openssl.on('close', function () {
    stdout = Buffer.from(stdout.toString('utf-8'))
    stderr = Buffer.from(stderr.toString('utf-8'))

    if (--needed < 1) {
      bothDone()
    }
  })
}

export interface FileData {
  path: string
  contents: string | undefined
}

export type SpawnWrapperCallback<Result> = (
  err: Error | null,
  code: number,
  stdout: Buffer,
  stderr: Buffer
) => Result

function spawnWrapper<CallbackResult>(
  params: string[],
  tmpFiles: false | string | string[],
  callback: SpawnWrapperCallback<CallbackResult>
) {
  const files = [] as FileData[]

  if (tmpFiles) {
    tmpFiles = Array.isArray(tmpFiles) ? [...tmpFiles] : [tmpFiles]
    params.forEach(function (value, i) {
      if (value === '--TMPFILE--') {
        const path = join(tempDir, crypto.randomBytes(20).toString('hex'))
        files.push({ path, contents: (tmpFiles as string[]).shift() })
        params[i] = path
      }
    })
  }

  const processFiles = function () {
    const file = files.shift()

    if (!file) {
      return spawnSSL()
    }

    fs.writeFile(file.path, file.contents ?? '', function () {
      processFiles()
    })
  }

  const spawnSSL = function () {
    spawnOpenSSL(params, function (err, code, stdout, stderr) {
      files.forEach(function (file) {
        fs.unlinkSync(file.path)
      })
      callback(err, code, stdout, stderr)
    })
  }

  processFiles()
}

export type ExecOpenSSLCallback = ((
  error: Error | null,
  key?: never
) => unknown) &
  ((error: Error | null, key: string) => unknown)

/**
 * Spawn an openssl command
 */
function execOpenSSL(
  params: string[],
  searchStr: string,
  callback: ExecOpenSSLCallback
): void
function execOpenSSL(
  params: string[],
  searchStr: string,
  tmpFiles: false | string | string[],
  callback: ExecOpenSSLCallback
): void
function execOpenSSL(
  params: string[],
  searchStr: string,
  tmpFiles: false | string | string[] | ExecOpenSSLCallback,
  callback?: ExecOpenSSLCallback
) {
  if (!callback && typeof tmpFiles == 'function') {
    callback = tmpFiles
    tmpFiles = false
  }

  spawnWrapper(
    params,
    tmpFiles as false | string | string[],
    function (err, code, stdout, stderr) {
      if (err) {
        return callback!(err)
      }

      const outStr = `${stdout}`
      const startMatch = outStr.match(
        new RegExp(`\\-+BEGIN ${searchStr}\\-+$`, 'm')
      )
      const start = startMatch ? (startMatch.index ?? 0) : -1

      const endMatch = outStr.match(new RegExp(`^-+END ${searchStr}-+`, 'm'))
      const end = endMatch
        ? (endMatch.index ?? 0) + (endMatch[0] || '').length
        : -1

      console.log({ outStr, start, end, searchStr })

      if (start >= 0 && end >= 0) {
        return callback!(null, outStr.substring(start, end))
      } else {
        const signal = 0
        return callback!(
          new Error(
            `${searchStr} not found from openssl output:\n---stdout---\n${stdout}\n---stderr---\n${stderr}\ncode: ${code}\nsignal: ${signal}`
          )
        )
      }
    }
  )
}
