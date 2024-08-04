/**
 * Generate key and cert sign by my root ca dynamically
 */

import fs from 'fs'
import path from 'path'
import { packageRoot } from '../utils/package'
import { createCertificate } from './pem'
import type * as tls from 'node:tls'

const pkiDir = path.normalize(`${packageRoot}/cert`)

const serviceKey = fs
  .readFileSync(`${pkiDir}/root/rootCA.key`)
  .toString('utf-8')
const serviceCertificate = fs
  .readFileSync(`${pkiDir}/root/rootCA.pem`)
  .toString('utf-8')

// http://datacenteroverlords.com/2012/03/01/creating-your-own-ssl-certificate-authority/
if (!fs.existsSync(`${pkiDir}/generated/`)) {
  fs.mkdirSync(`${pkiDir}/generated/`)
}

export const getRootPKI = (): tls.SecureContextOptions => ({
  key: serviceKey,
  cert: serviceCertificate,
})

/**
 * generate key and cert sign by my root ca dynamically
 * @param commonName
 * @param callback
 */
export function getPKI(
  commonName: string,
  callback?: (kpi: tls.SecureContextOptions) => void
) {
  const cnDir = `${pkiDir}/generated/${commonName}`
  const keyPath = `${cnDir}/key.pem`
  const certPath = `${cnDir}/cert.pem`
  if (fs.existsSync(keyPath)) {
    callback?.({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    })
    return
  }
  createCertificate(
    {
      serial: Date.now(),
      commonName: commonName,
      serviceKey: serviceKey,
      serviceCertificate: serviceCertificate,
      days: 3650,
    },
    (error, ret) => {
      if (!fs.existsSync(cnDir)) {
        fs.mkdirSync(cnDir)
      }
      console.log({ error, ret })
      fs.writeFileSync(certPath, new Buffer(ret!.certificate!, 'utf-8'))
      fs.writeFileSync(keyPath, new Buffer(ret!.clientKey!, 'utf-8'))
      callback?.({
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      })
    }
  )
}
