import TelegramBot from "node-telegram-bot-api";

import config from "../config";

if (!config.TELEGRAM_BOT_TOKEN) throw new Error("Telegram token not provided");

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

export default bot;
