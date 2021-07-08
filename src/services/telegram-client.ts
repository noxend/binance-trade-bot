import { StringSession } from 'telegram/sessions'
import { Logger } from 'telegram/extensions'
import { TelegramClient } from 'telegram'

import config from '../config'

export default (stringSession?: string): TelegramClient => {
  if (!config.TELEGRAM_API_ID || !config.TELEGRAM_API_HASH) throw new Error('')

  const client = new TelegramClient(
    new StringSession(stringSession),
    +config.TELEGRAM_API_ID,
    config.TELEGRAM_API_HASH,
    {
      baseLogger: new Logger('warn'),
      connectionRetries: 5,
    }
  )

  if (config.NODE_ENV !== 'production') {
    client.session.setDC(2, '149.154.167.40', 443)
  }

  return client
}
