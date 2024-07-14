import pc from 'picocolors'

const primaryColor = pc.green
const secondaryColor = pc.blue
const disabledColor = pc.dim

export const title = (text: string) => pc.underline(pc.bold(primaryColor(text)))
export const link = (text: string) => pc.bold(secondaryColor(text))
export const tooltip = (text: string) => `${primaryColor(`› `)} ${text}`

export const tip = (text: string) => pc.bold(disabledColor(text))

export default { title, tooltip, link, tip }
