import { platform } from 'node:process'
import { exec } from 'node:child_process'

const start =
  platform == 'darwin' ? 'open' : platform == 'win32' ? 'start' : 'xdg-open'

export const openBrowser = (url: URL | string) => {
  exec(`${start  } ${  url}`)
}
