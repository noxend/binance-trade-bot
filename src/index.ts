import createTelegramClient from './services/telegram-client'
import bot from './services/telegram-bot'

import { Api } from 'telegram'
import config from './config'

let VALUE = ''
let IS_INPUT = false

bot.onText(/\/auth/, async (msg, match) => {
  await auth(msg.chat.id)
})

bot.on('message', (msg) => {
  if (!msg.text) return

  if (IS_INPUT) {
    VALUE = msg.text
  }
})

const client = createTelegramClient()

const input = (chatId: number, text: string): Promise<string> =>
  new Promise(async (resolve) => {
    IS_INPUT = true

    await bot.sendMessage(chatId, text)

    const interval = setInterval(() => {
      if (VALUE) {
        clearInterval(interval)
        resolve(VALUE)
        IS_INPUT = false
        VALUE = ''
      }
    }, 1000)
  })

async function auth(chatId: number) {
  if (!client.connected) {
    await client.connect()
  }

  if (await client.checkAuthorization()) {
    return
  }

  const phoneNumber = await input(chatId, 'phone number ?')

  try {
    const { phoneCodeHash } = await client.sendCode(
      {
        apiHash: config.TELEGRAM_API_HASH,
        apiId: Number(config.TELEGRAM_API_ID),
      },
      phoneNumber
    )

    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode: await input(chatId, 'code ?'),
      })
    )

    await bot.sendSticker(chatId, 'CAACAgUAAxkBAAECiIVg4qSDJavupfoj3csX7qTAuN1hrQACsgIAAhExQFfgcZ-2saVC8SAE')

    return result
  } catch (error) {
    VALUE = ''
    IS_INPUT = false
    await bot.sendMessage(chatId, `🔴 ${error.message}`)
  }
}
