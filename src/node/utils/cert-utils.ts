import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import forge from 'node-forge'
import { packageJson, packageRoot } from './package'
import { tempDir } from './temp-dir'

const { md, pki } = forge

export type PrivateKey = forge.pki.PrivateKey
export type Certificate = forge.pki.Certificate

/**
 * the location where the root key and certificate can be found
 */
const rootDir = (() => {
  const packageCertRoot = join(packageRoot, 'cert')
  if (existsSync(join(packageCertRoot, 'root', 'rootCA.key'))) {
    return packageCertRoot
  }
  return join(tempDir(), 'cert')
})()

interface RootKeyFiles {
  key: string
  cert: string
}

const ROOT_KEY_FILES: RootKeyFiles = getRootKeyFiles()

function getRootKeyFiles(): RootKeyFiles {
  const key = join(rootDir, 'root', 'rootCA.key')
  const cert = join(rootDir, 'root', 'rootCA.crt')
  if (existsSync(key) && existsSync(cert)) return { key, cert }
  return {
    key: join(tempDir(), 'cert', 'root', 'rootCA.key'),
    cert: join(tempDir(), 'cert', 'root', 'rootCA.crt'),
  }
}

export const generatedKeyFiles = (host: string): RootKeyFiles => {
  const root = join(tempDir(), 'cert', 'generated', host)
  return {
    key: `${root}.key`,
    cert: `${root}.crt`,
  }
}

export interface CertificateInfo {
  key: string | Buffer
  cert: string | Buffer
}

export interface RootCertificateInfo extends CertificateInfo {
  key: string | Buffer
  cert: string | Buffer
  forgeCert: Certificate
  forgeKey: PrivateKey
}

// Create a root CA certificate
const generateRootCert = (): RootCertificateInfo => {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = Date.now().toString()
  cert.validity.notBefore = new Date()
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() + -1)

  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  const attrs = [
    { shortName: 'C', value: 'BE' },
    { shortName: 'ST', value: 'OVL' },
    { shortName: 'L', value: 'Ghent' },
    { shortName: 'O', value: packageJson.name },
    { shortName: 'OU', value: packageJson.name },
    { shortName: 'CN', value: 'localhost' },
    {
      name: 'emailAddress',
      value: '3611758+JorisAerts@users.noreply.github.com',
    },
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

  return {
    ...getOrWriteKeys('root', ROOT_KEY_FILES, {
      key: () => pki.privateKeyToPem(keys.privateKey),
      cert: () => pki.certificateToPem(cert),
    }),
    forgeCert: cert,
    forgeKey: keys.privateKey,
  }
}

const { key: rootKey, cert: rootCert, forgeCert: forgeRootCert, forgeKey: forgeRootKey } = generateRootCert()

const createCertForHost = (hostname: string) => {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = Date.now().toString()
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)

  const attrs = [{ shortName: 'CN', value: hostname }]

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

  return getOrWriteKeys(hostname, generatedKeyFiles(hostname), {
    key: () => pki.privateKeyToPem(keys.privateKey),
    cert: () => pki.certificateToPem(cert),
  })
}

function getOrWriteKeys(hostname: string, keyFiles: typeof ROOT_KEY_FILES, { key, cert }: { key: () => string; cert: () => string }): CertificateInfo {
  if (existsSync(keyFiles.cert) && existsSync(keyFiles.key)) {
    //console.info('reading keys')
    return {
      key: readFileSync(keyFiles.key),
      cert: readFileSync(keyFiles.cert),
    }
  }

  //console.info('writing keys for host: ', hostname)
  //console.info('   => ', dirname(keyFiles.cert))
  const data = { key: key(), cert: cert() }
  mkdirSync(dirname(keyFiles.key), { recursive: true })
  writeFileSync(keyFiles.key, data.key)
  mkdirSync(dirname(keyFiles.cert), { recursive: true })
  writeFileSync(keyFiles.cert, data.cert)

  return data
}

export const getRootCert = () => ({
  cert: rootCert,
  key: rootKey,
})

export { rootKey, rootCert, createCertForHost }
