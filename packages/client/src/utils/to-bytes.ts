const suffix = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

const precision = 100

export const toBytes = (num?: number) => {
  console.log(num)
  if (num == null) return 'unknown'
  let i = 0
  while (num > 1024 && ++i) {
    num /= 1024
    console.log('=>', num, i)
  }
  num = Math.round(num * precision) / precision
  return new Intl.NumberFormat('en-US').format(num) + suffix[i]
}