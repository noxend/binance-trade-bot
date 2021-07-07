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

const userClient = createTelegramClient()

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
  await userClient.connect()

  const phoneNumber = await input(chatId, 'phone number ?')

  try {
    const { phoneCodeHash } = await userClient.invoke(
      new Api.auth.SendCode({
        phoneNumber,
        apiHash: config.TELEGRAM_API_HASH,
        apiId: +config.TELEGRAM_API_ID!,
        settings: new Api.CodeSettings({}),
      })
    )

    await userClient.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode: await input(chatId, 'code ?'),
      })
    )

    await bot.sendSticker(chatId, 'CAACAgUAAxkBAAECiIVg4qSDJavupfoj3csX7qTAuN1hrQACsgIAAhExQFfgcZ-2saVC8SAE')
  } catch (error) {
    VALUE = ''
    IS_INPUT = false
    await bot.sendMessage(chatId, `🔴 ${error.message}`)
  }
}
