import createTelegramClient from './services/telegram-client'
import bot from './services/telegram-bot'

let VALUE = ''
let STAGE: Stage = null

bot.onText(/\/auth/, (msg, match) => {
  auth(msg.chat.id)
})

bot.on('message', (msg) => {
  if (!msg.text) return

  switch (STAGE) {
    case 'phone':
      VALUE = msg.text
      break

    case 'code':
      VALUE = msg.text
      break

    default:
      break
  }
})

type Stage = 'phone' | 'code' | 'password' | null

const userClient = createTelegramClient()

const input = (chatId: number, text: string, stage: Stage): Promise<string> =>
  new Promise(async (resolve) => {
    STAGE = stage

    await bot.sendMessage(chatId, text)

    const interval = setInterval(() => {
      if (STAGE && VALUE) {
        clearInterval(interval)
        resolve(VALUE)
        STAGE = null
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
      VALUE = ''
      STAGE = null
    },
  })
}
