import type { Socket } from 'net'
import { NEWLINE } from '../constants'

export const newLine = (socket: Socket | { write: (str: string) => unknown }) => socket.write(NEWLINE)
