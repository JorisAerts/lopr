/**
 * modified from https://github.com/andris9/pem
 */
import { spawn } from 'child_process'
import os from 'os'
import pathlib from 'path'
import fs from 'fs'
import crypto from 'crypto'
import Certificate = module

const tempDir = os.tmpdir() || '/tmp'

// PUBLIC API

type Callback = (err: string, data: string) => void

/**
 * Creates a private key
 *
 * @param {Number} [keyBitsize=1024] Size of the key, defaults to 1024bit
 * @param {Function} callback Callback function with an error object and {key}
 */
export function createPrivateKey(callback): void
export function createPrivateKey(keyBitsize: number, callback): void
export function createPrivateKey(keyBitsize: unknown, callback) {
  if (!callback && typeof keyBitsize == 'function') {
    callback = keyBitsize
    keyBitsize = undefined
  }

  keyBitsize = Number(keyBitsize) || 1024

  const params = [
    'genrsa',
    '-rand',
    '/var/log/mail:/var/log/messages',
    `${keyBitsize}`,
  ]

  execOpenSSL(params, 'RSA PRIVATE KEY', function (error, key) {
    if (error) {
      return callback(error)
    }
    return callback(null, { key: key })
  })
}

/**
 * Creates a Certificate Signing Request
 *
 * If client key is undefined, a new key is created automatically. The used key is included
 * in the callback return as clientKey
 *
 * @param {Object} [options] Optional options object
 * @param {String} [options.clientKey] Optional client key to use
 * @param {Number} [options.keyBitsize] If clientKey is undefined, bit size to use for generating a new key (defaults to 1024)
 * @param {String} [options.hash] Hash function to use (either md5 or sha1, defaults to sha1)
 * @param {String} [options.country] CSR country field
 * @param {String} [options.state] CSR state field
 * @param {String} [options.locality] CSR locality field
 * @param {String} [options.organization] CSR organization field
 * @param {String} [options.organizationUnit] CSR organizational unit field
 * @param {String} [options.commonName="localhost"] CSR common name field
 * @param {String} [options.emailAddress] CSR email address field
 * @param {Function} callback Callback function with an error object and {csr, clientKey}
 */
export function createCSR(options, callback) {
  if (!callback && typeof options == 'function') {
    callback = options
    options = undefined
  }

  options = options || {}

  if (!options.clientKey) {
    createPrivateKey(options.keyBitsize || 1024, function (error, keyData) {
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
      createPrivateKey(options.keyBitsize || 1024, function (error, keyData) {
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
  const tmpfiles = [options.csr]
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
    tmpfiles.push(options.serviceCertificate)
    tmpfiles.push(options.serviceKey)
  } else {
    params.push('-signkey')
    params.push('--TMPFILE--')
    tmpfiles.push(options.serviceKey)
  }

  execOpenSSL(params, 'CERTIFICATE', tmpfiles, function (error, data) {
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
export function readCertificateInfo(certificate, callback) {
  if (!callback && typeof certificate == 'function') {
    callback = certificate
    certificate = undefined
  }

  certificate = (certificate || '').toString()

  const type = certificate.match(/BEGIN CERTIFICATE REQUEST/) ? 'req' : 'x509',
    params = [type, '-noout', '-text', '-in', '--TMPFILE--']
  spawnWrapper(params, certificate, function (err, code, stdout, stderr) {
    if (err) {
      return callback(err)
    }
    return fetchCertificateData(stdout, callback)
  })
}

/**
 * get the modulus from a certificate, a CSR or a private key
 *
 * @param {String} certificate PEM encoded, CSR PEM encoded, or private key
 * @param {Function} callback Callback function with an error object and {modulus}
 */
export function getModulus(certificate, callback) {
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

function fetchCertificateData(certData, callback) {
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

function generateCSRSubject(options: Certificate) {
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
    if (csrData[key]) {
      csrBuilder.push(`/${key}=${csrData[key].replace(RX_CSR, ' ').trim()}`)
    }
  })

  return csrBuilder.join('')
}

/**
 * Generically spawn openSSL, without processing the result
 *
 * @param {Array}        params   The parameters to pass to openssl
 * @param {String|Array} tmpfiles    Stuff to pass to tmpfiles
 * @param {Function}     callback Called with (error, exitCode, stdout, stderr)
 */
function spawnOpenSSL(params: string[], callback) {
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

function spawnWrapper(params: string[], tmpfiles: string[], callback) {
  const files = [] as FileData[]

  if (tmpfiles) {
    tmpfiles = [...tmpfiles]
    params.forEach(function (value, i) {
      if (value === '--TMPFILE--') {
        const path = pathlib.join(
          tempDir,
          crypto.randomBytes(20).toString('hex')
        )
        files.push({ path, contents: tmpfiles.shift() })
        params[i] = path
      }
    })
  }

  const processFiles = function () {
    const file = files.shift()

    if (!file) {
      return spawnSSL()
    }

    fs.writeFile(file.path, file.contents ?? '', function (err, bytes) {
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

/**
 * Spawn an openssl command
 */
function execOpenSSL(params: string[], searchStr: string, callback): void
function execOpenSSL(
  params: string[],
  searchStr: string,
  tmpfiles: string[],
  callback
): void
function execOpenSSL(
  params: string[],
  searchStr: string,
  tmpfiles: string[],
  callback
) {
  if (!callback && typeof tmpfiles == 'function') {
    callback = tmpfiles
    tmpfiles = false
  }

  spawnWrapper(params, tmpfiles, function (err, code, stdout, stderr) {
    let start, end

    if (err) {
      return callback(err)
    }

    if (
      (start = stdout.match(new RegExp(`\\-+BEGIN ${searchStr}\\-+$`, 'm')))
    ) {
      start = start.index
    } else {
      start = -1
    }

    if ((end = stdout.match(new RegExp(`^\\-+END ${searchStr}\\-+`, 'm')))) {
      end = end.index + (end[0] || '').length
    } else {
      end = -1
    }

    if (start >= 0 && end >= 0) {
      return callback(null, stdout.substring(start, end))
    } else {
      return callback(
        new Error(
          `${searchStr} not found from openssl output:\n---stdout---\n${
            stdout
          }\n---stderr---\n${stderr}\ncode: ${code}\nsignal: ${signal}`
        )
      )
    }
  })
}
