import createTelegramClient from './services/telegram-client'
import bot from './services/telegram-bot'

let VALUE = ''
let IS_INPUT = false

bot.onText(/\/auth/, async (msg, match) => {
  await auth(msg.chat.id)
  bot.sendSticker(msg.chat.id, 'CAACAgUAAxkBAAECiIVg4qSDJavupfoj3csX7qTAuN1hrQACsgIAAhExQFfgcZ-2saVC8SAE')
})

bot.on('message', (msg) => {
  if (!msg.text) return

  if (IS_INPUT) {
    VALUE = msg.text
  }
})

type Stage = 'phone' | 'code' | 'password' | null

const userClient = createTelegramClient()

const input = (chatId: number, text: string, stage: Stage): Promise<string> =>
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
  await userClient.start({
    phoneNumber: () => input(chatId, 'Please enter phone number (+38...)', 'phone'),
    password: () => input(chatId, 'Please enter password', 'password'),
    phoneCode: () => input(chatId, 'Please enter code', 'code'),
    onError: (err) => {
      bot.sendMessage(chatId, `🔴 #ERROR: ${err.message}`)
      IS_INPUT = false
      VALUE = ''
    },
  })
}
