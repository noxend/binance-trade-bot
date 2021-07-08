import base64url from 'base64url'
import { Api } from 'telegram'
import qr from 'qrcode'

import createTelegramClient from './services/telegram-client'
import bot from './services/telegram-bot'
import config from './config'

const client = createTelegramClient()

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

bot.onText(/\/auth/, async (msg, match) => {
  await logInWithQrCode(msg.chat.id)
})

const input = (chatId: number, text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bot.once('message', (msg) => {
      if (msg.text) resolve(msg.text)
      else reject(new Error('some error'))
    })
  })
}

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
    await bot.sendMessage(chatId, `🔴 ${error.message}`)
  }
}

async function logInWithQrCode(chatId: number) {
  if (!client.connected) {
    await client.connect()
  }

  const result = await client.invoke(
    new Api.auth.ExportLoginToken({
      apiId: Number(config.TELEGRAM_API_ID),
      apiHash: config.TELEGRAM_API_HASH,
      exceptIds: [],
    })
  )

  if (!(result instanceof Api.auth.LoginToken)) {
    throw new Error('Unexpected')
  }

  const { token, expires } = result

  const url = `tg://login?token=${base64url(token)}`

  await qr.toFile('qr.png', url)

  await bot.sendPhoto(chatId, 'qr.png')

  client.addEventHandler((update: Api.TypeUpdate) => {
    if (update instanceof Api.UpdateLoginToken) {
      bot.sendMessage(chatId, client.session.save() as unknown as string)
    }
  })
}
