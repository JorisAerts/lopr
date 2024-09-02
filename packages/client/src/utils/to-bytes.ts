const suffix = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

const precision = 100

export const toBytes = (num?: number, defaultValue = '') => {
  if (num == null) return defaultValue
  let i = 0
  while (num > 1024 && ++i) {
    num /= 1024
  }
  num = Math.round(num * precision) / precision
  return new Intl.NumberFormat('en-US').format(num) + suffix[i]
}
