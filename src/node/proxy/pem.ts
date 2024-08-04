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
} from './Certificate'

const tempDir = os.tmpdir() || '/tmp'

// PUBLIC API

export interface CreatePrivateKeyCallback {
  (err: Error | null): void

  (err: string | null, opts: { key: string }): void
}

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

  const params = [
    'genrsa',
    '-rand',
    '/var/log/mail:/var/log/messages',
    `${keyBitSize}`,
  ]

  execOpenSSL(params, 'RSA PRIVATE KEY', (error, key) => {
    return error ? callback!(error) : callback!(null, { key })
  })
}

export interface CreateCSROptions extends CertificateFields {
  clientKey: string
  keyBitSize: number
  hash: string
}

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
  callback: any
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
      options.clientKey = keyData.key
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
        csr: data,
        clientKey: options.clientKey,
      }
      return callback(null, response)
    }
  )
}

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
export function createCertificate(options, callback) {
  if (!callback && typeof options == 'function') {
    callback = options
    options = undefined
  }

  options = options || {}

  if (!options.csr) {
    createCSR(options, function (error, keyData) {
      if (error) {
        return callback(error)
      }
      options.csr = keyData.csr
      options.clientKey = keyData.clientKey
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
        options.serviceKey = keyData.key
        createCertificate(options, callback)
      })
      return
    }
  }

  const params = [
    'x509',
    '-req',
    '-days',
    Number(options.days) || '365',
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
    tmpFiles.push(options.serviceKey)
  } else {
    params.push('-signkey')
    params.push('--TMPFILE--')
    tmpFiles.push(options.serviceKey)
  }

  execOpenSSL(params, 'CERTIFICATE', tmpFiles, function (error, data) {
    if (error) {
      return callback(error)
    }
    const response = {
      csr: options.csr,
      clientKey: options.clientKey,
      certificate: data,
      serviceKey: options.serviceKey,
    }
    return callback(null, response)
  })
}

/**
 * Exports a public key from a private key, CSR or certificate
 *
 * @param {String} certificate PEM encoded private key, CSR or certificate
 * @param {Function} callback Callback function with an error object and {publicKey}
 */
export function getPublicKey(certificate, callback) {
  if (!callback && typeof certificate == 'function') {
    callback = certificate
    certificate = undefined
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

  execOpenSSL(params, 'PUBLIC KEY', certificate, function (error, key) {
    if (error) {
      return callback(error)
    }
    return callback(null, { publicKey: key })
  })
}

/**
 * Reads subject data from a certificate or a CSR
 *
 * @param {String} certificate PEM encoded CSR or certificate
 * @param {Function} callback Callback function with an error object and {country, state, locality, organization, organizationUnit, commonName, emailAddress}
 */
export function readCertificateInfo(certificate: string, callback) {
  if (!callback && typeof certificate == 'function') {
    callback = certificate
    certificate = undefined
  }

  certificate = (certificate || '').toString()

  const type = certificate.match(/BEGIN CERTIFICATE REQUEST/) ? 'req' : 'x509',
    params = [type, '-noout', '-text', '-in', '--TMPFILE--']
  spawnWrapper(params, certificate, (err, code, stdout, stderr) =>
    err ? callback(err) : fetchCertificateData(stdout, callback)
  )
}

/**
 * get the modulus from a certificate, a CSR or a private key
 *
 * @param {String} certificate PEM encoded, CSR PEM encoded, or private key
 * @param {Function} callback Callback function with an error object and {modulus}
 */
export function getModulus(certificate: string, callback) {
  let type = ''
  if (certificate.match(/BEGIN CERTIFICATE REQUEST/)) {
    type = 'req'
  } else if (certificate.match(/BEGIN RSA PRIVATE KEY/)) {
    type = 'rsa'
  } else {
    type = 'x509'
  }
  const params = [type, '-noout', '-modulus', '-in', '--TMPFILE--']
  spawnWrapper(params, certificate, function (err, code, stdout, stderr) {
    if (err) {
      return callback(err)
    }
    const match = stdout.match(/Modulus=([0-9a-fA-F]+)$/m)
    if (match) {
      return callback(null, { modulus: match[1] })
    } else {
      return callback(new Error('No modulus'))
    }
  })
}

/**
 * Gets the fingerprint for a certificate
 *
 * @param {String} PEM encoded certificate
 * @param {Function} callback Callback function with an error object and {fingerprint}
 */
export function getFingerprint(certificate, callback) {
  const params = ['x509', '-in', '--TMPFILE--', '-fingerprint', '-noout']

  spawnWrapper(params, certificate, function (err, code, stdout, stderr) {
    if (err) {
      return callback(err)
    }
    const match = stdout.match(/Fingerprint=([0-9a-fA-F:]+)$/m)
    if (match) {
      return callback(null, { fingerprint: match[1] })
    } else {
      return callback(new Error('No fingerprint'))
    }
  })
}

// HELPER FUNCTIONS

function fetchCertificateData(certData: string, callback) {
  certData = (certData || '').toString()

  let subject, extra, tmp
  const certValues = {} as Record<string, unknown>
  const validity = {} as Record<string, unknown>

  if ((subject = certData.match(/Subject:([^\n]*)\n/)) && subject.length > 1) {
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
    certValues.emailAddress = (tmp && tmp[1]) || ''
  }
  if ((tmp = certData.match(/Not Before\s?:\s?([^\n]*)\n/)) && tmp.length > 1)
    validity.start = Date.parse((tmp && tmp[1]) || '')
  if ((tmp = certData.match(/Not After\s?:\s?([^\n]*)\n/)) && tmp.length > 1)
    validity.end = Date.parse((tmp && tmp[1]) || '')
  if (validity.start && validity.end) certValues.validity = validity

  callback(null, certValues)
}

const RX_CSR = /[^\w .\-@]+/g

function generateCSRSubject(options: CertificateOptions) {
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

interface SpawnOpenSSLCallback {
  (error: Error | null, exitCode: number, stdout: Buffer, stderr: Buffer): void

  (error: Error | null, exitCode: number): void

  (error: Error | null, exitCode: number, stdout: Buffer, stderr: Buffer): void
}

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
        code
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

type FileData = { path: string; contents: string | undefined }

function spawnWrapper(
  params: string[],
  tmpFiles: false | string | string[],
  callback
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

interface ExecOpenSSLCallback {
  (error: Error | null): unknown

  (error: Error | null, key: string): unknown
}

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
      let start, end

      if (err) {
        return callback!(err)
      }

      if (
        (start = stdout.match(new RegExp(`\\-+BEGIN ${searchStr}\\-+$`, 'm')))
      ) {
        start = start.index
      } else {
        start = -1
      }

      if ((end = stdout.match(new RegExp(`^-+END ${searchStr}-+`, 'm')))) {
        end = end.index + (end[0] || '').length
      } else {
        end = -1
      }

      if (start >= 0 && end >= 0) {
        return callback!(null, stdout.substring(start, end))
      } else {
        const signal = 0
        return callback!(
          new Error(
            `${searchStr} not found from openssl output:\n---stdout---\n${
              stdout
            }\n---stderr---\n${stderr}\ncode: ${code}\nsignal: ${signal}`
          )
        )
      }
    }
  )
}
