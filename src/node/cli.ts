import process from 'node:process'

export type CLIOptions = {
  open: boolean
  port: number
}

export const processCliParams = (): Partial<CLIOptions> => {
  const opts: Partial<CLIOptions> = {}

  for (let i = 2, len = process.argv.length; i < len; ++i) {
    switch (process.argv[i]) {
      case '--open':
        opts.open = true
        break

      case '--port': {
        if (process.argv[i + 1]?.startsWith('-')) continue
        const port = process.argv[++i]
        if (port) opts.port = parseInt(process.argv[++i])
        break
      }
    }
  }

  return opts
}
