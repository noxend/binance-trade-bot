import { StringSession } from 'telegram/sessions'
import { Logger } from 'telegram/extensions'
import { TelegramClient } from 'telegram'

import config from '../config'

export default (): TelegramClient => {
  if (!config.TELEGRAM_API_ID || !config.TELEGRAM_API_HASH) throw new Error('')

  const stringSession = new StringSession(process.env.SESSION)

  return new TelegramClient(stringSession, +config.TELEGRAM_API_ID, config.TELEGRAM_API_HASH, {
    baseLogger: new Logger('warn'),
    connectionRetries: 5,
  })
}
