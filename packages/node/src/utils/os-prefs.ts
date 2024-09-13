import process from 'node:process'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { homedir } from 'os'
import { APP_NAME } from 'lopr-shared'

const preferencesDir =
  process.env.APPDATA ||
  (process.platform == 'darwin' //
    ? join(homedir(), 'Library', 'Preferences')
    : join(homedir(), '.local', 'share'))

export const preferencesFile = join(preferencesDir, `${APP_NAME}.prefs`)

export const getPreferences = async () => readFile(preferencesFile, 'utf8')
export const storePreferences = async (prefs: any) => writeFile(preferencesFile, JSON.stringify(prefs, null, 2))
