import bodyParser from 'body-parser'
import TelegramBot, { Update } from 'node-telegram-bot-api'
import express, { Request } from 'express'

import config from '../config'

if (!config.TELEGRAM_BOT_TOKEN) throw new Error('Telegram token not provided')

let bot: TelegramBot

if (config.NODE_ENV === 'production') {
  console.log(config)
  bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN)
  bot.setWebHook(`${config.APP_HOST}/bot`)

  const app = express()

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.get('/', (req, res) => {
    res.sendStatus(200)
  })

  app.post('/bot', (req: Request<{}, {}, Update>, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
  })

  app.listen(config.PORT, () => {
    console.log('listening ok')
  })
} else {
  bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true })
}

export default bot
