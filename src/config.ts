import dotenv from "dotenv";

dotenv.config();

const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH,
  TELEGRAM_API_ID: process.env.TELEGRAM_API_ID,
};

export default config;
