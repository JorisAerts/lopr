import process from 'node:process'
import { join } from 'path'
import { readFile, rm, writeFile } from 'fs/promises'
import { homedir } from 'os'
import { APP_NAME } from 'lopr-shared'
import type { InternalProxyState } from '../server/server-state'
import { existsSync } from 'fs'

/**
 * The ones that are persisted and loaded from the system preferences
 */
type Preferences = Partial<InternalProxyState>

const preferencesDir =
  process.env.APPDATA ||
  (process.platform == 'darwin' //
    ? join(homedir(), 'Library', 'Preferences')
    : join(homedir(), '.local', 'share'))

export const preferencesFile = join(preferencesDir, `${APP_NAME}.prefs`)

const cleanupPrefs = (prefs: Preferences) => {
  prefs = { ...prefs }
  delete prefs.config
  delete prefs.cache
  delete prefs.pausedRequests
  delete prefs.pausedResponses
  return prefs
}

export const getPreferences = async (): Promise<Preferences> => (!existsSync(preferencesFile) ? {} : (JSON.parse(await readFile(preferencesFile, 'utf8')) as Preferences))

export const storePreferences = async (prefs: Preferences) => await writeFile(preferencesFile, JSON.stringify(cleanupPrefs(prefs), null, 2))
export const deletePreferences = async () => await rm(preferencesFile, { force: true })
