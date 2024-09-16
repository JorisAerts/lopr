const numberFormatter = new Intl.NumberFormat('en-US')

export const formatNumber = (text: number | bigint) => numberFormatter.format(text)
