// certUtils.ts
import forge from 'node-forge'
import * as fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { packageJson, packageRoot } from '../utils/package'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pki = forge.pki

// Create a root CA certificate
const generateRootCert = () => {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  const attrs = [
    { name: 'commonName', value: `${packageJson.name} CA` },
    { name: 'countryName', value: 'BE' },
    { shortName: 'ST', value: 'Brussels' },
    { name: 'localityName', value: 'Brussels' },
    { name: 'organizationName', value: packageJson.name },
    //{ shortName: 'OU', value: 'Proxy Division' },
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

  if (fs.existsSync(path.join(packageRoot, 'rootCA.key'))) {
    return {
      key: fs.readFileSync(path.join(packageRoot, 'rootCA.key')),
      cert: fs.readFileSync(path.join(packageRoot, 'rootCA.crt')),
      forgeCert: cert,
      forgeKey: keys.privateKey,
    }
  }

  cert.sign(keys.privateKey, forge.md.sha256.create())

  const pemKey = pki.privateKeyToPem(keys.privateKey)
  const pemCert = pki.certificateToPem(cert)

  fs.writeFileSync(path.join(packageRoot, 'rootCA.key'), pemKey)
  fs.writeFileSync(path.join(packageRoot, 'rootCA.crt'), pemCert)

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

export const readRootCert = () =>
  fs.readFileSync(path.join(packageRoot, 'rootCA.crt'))

const createCertForHost = (hostname: string) => {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = new Date().getTime().toString()
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

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

  cert.sign(forgeRootKey, forge.md.sha256.create())

  return {
    key: pki.privateKeyToPem(keys.privateKey),
    cert: pki.certificateToPem(cert),
  }
}

export { rootKey, rootCert, createCertForHost }
