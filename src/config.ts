import dotenv from 'dotenv'

dotenv.config()

const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH,
  TELEGRAM_API_ID: process.env.TELEGRAM_API_ID,
  MONGO_URI: process.env.MONGO_URI,
  BINANCE_API_KEY: process.env.BINANCE_API_KEY,
  BINANCE_SECRET_KEY: process.env.BINANCE_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_HOST: process.env.APP_HOST,
  PORT: process.env.APP_HOST || 8080,
}

export default config
