import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { md, pki } from 'node-forge'
import { packageRoot } from '../../utils/package'

export type PrivateKey = pki.PrivateKey
export type Certificate = pki.Certificate

const keyFiles = {
  key: join(packageRoot, `${'cert/root'}rootCA.key`),
  cert: join(packageRoot, `${'cert/root'}rootCA.crt`),
}

export interface RootCertificate {
  key: string | Buffer
  cert: string | Buffer
  forgeCert: Certificate
  forgeKey: PrivateKey
}

// Create a root CA certificate
const generateRootCert = (): RootCertificate => {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  const attrs = [
    { shortName: 'C', value: '' },
    { shortName: 'ST', value: '' },
    { shortName: 'L', value: '' },
    { shortName: 'O', value: '' },
    { shortName: 'OU', value: '' },
    { shortName: 'CN', value: 'localhost' },
    { name: 'emailAddress', value: '' },
  ]

  cert.setSubject(attrs)
  cert.setIssuer(attrs)
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'subjectKeyIdentifier',
    },
  ])

  cert.sign(keys.privateKey, md.sha256.create())

  if (existsSync(keyFiles.cert) && existsSync(keyFiles.key)) {
    console.info('reading keys')
    return {
      key: readFileSync(keyFiles.key),
      cert: readFileSync(keyFiles.cert),
      forgeCert: cert,
      forgeKey: keys.privateKey,
    }
  }

  const pemKey = pki.privateKeyToPem(keys.privateKey)
  const pemCert = pki.certificateToPem(cert)

  console.info('writing keys')
  writeFileSync(keyFiles.key, pemKey)
  writeFileSync(keyFiles.cert, pemCert)

  return {
    key: pemKey,
    cert: pemCert,
    forgeCert: cert,
    forgeKey: keys.privateKey,
  }
}

const {
  key: rootKey,
  cert: rootCert,
  forgeCert: forgeRootCert,
  forgeKey: forgeRootKey,
} = generateRootCert()

export const readRootCert = () => rootKey

const createCertForHost = (hostname: string) => {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = Date.now().toString()
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  const attrs = [{ name: 'commonName', value: hostname }]

  cert.setSubject(attrs)
  cert.setIssuer(forgeRootCert.subject.attributes)
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: false,
    },
    {
      name: 'keyUsage',
      digitalSignature: true,
      keyEncipherment: true,
    },
    {
      name: 'subjectAltName',
      altNames: [{ type: 2, value: hostname }],
    },
  ])

  cert.sign(forgeRootKey, md.sha256.create())
  const pemKey = pki.privateKeyToPem(keys.privateKey)
  const pemCert = pki.certificateToPem(cert)

  return {
    key: pemKey,
    cert: pemCert,
  }
}

export { rootKey, rootCert, createCertForHost }
