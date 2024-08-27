import pc from 'picocolors'

const primaryColor = pc.cyan
const secondaryColor = pc.blue
const disabledColor = pc.dim

export const title = (text: string) => pc.underline(pc.bold(primaryColor(text)))
export const link = (text: string) => pc.bold(secondaryColor(text))
export const tooltip = (text: string) => `${primaryColor(`› `)} ${text}`

export const tip = (text: string) => pc.bold(disabledColor(text))

export default {
  title,
  tooltip,
  link,
  tip,

  bold: pc.bold,
  dim: pc.dim,
  inverse: pc.inverse,
  italic: pc.italic,
  strikethrough: pc.strikethrough,
  underline: pc.underline,
  hidden: pc.hidden,

  reset: pc.reset,

  white: pc.white,
  black: pc.white,
  yellow: pc.yellow,
  red: pc.red,
  green: pc.green,
  blue: pc.blue,
  magenta: pc.magenta,
  cyan: pc.cyan,
}
