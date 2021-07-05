import { StringSession } from 'telegram/sessions'
import { Logger } from 'telegram/extensions'
import { TelegramClient } from 'telegram'

import config from '../config'

const stringSession = new StringSession(process.env.SESSION)

export default (): TelegramClient => {
  if (!config.TELEGRAM_API_ID || !config.TELEGRAM_API_HASH) throw new Error('')

  return new TelegramClient(stringSession, +config.TELEGRAM_API_ID, config.TELEGRAM_API_HASH, {
    connectionRetries: 5,
    baseLogger: new Logger('warn'),
  })
}
