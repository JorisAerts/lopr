type EmailAddress = string

export interface Certificate {
  C: string
  ST: string
  L: string
  O: string
  OU: string
  CN: string
  emailAddress: EmailAddress
}

export interface CertificateFields {
  /**
   * alias for C
   */
  country: string
  /**
   * alias for ST
   */
  state: string
  /**
   * alias for L
   */
  locality: string
  /**
   * alias for O
   */
  organization: string
  /**
   * alias for OU
   */
  organizationUnit: string
  /**
   * alias for CN
   */
  commonName: string

  emailAddress: EmailAddress
}

export interface CertificateOptions extends Certificate, CertificateFields {}
