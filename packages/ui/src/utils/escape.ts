/**
 * Escaping utils for various forms of text
 */

const RX_RX = /[-/\\^$*+?.()|[\]{}]/g

/**
 * Escape a string value, for usage with `new RegEx(...)`
 */
export const escapeRegex = (value: string) => value.replace(RX_RX, '\\$&')
