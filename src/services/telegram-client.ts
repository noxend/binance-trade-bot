import { StringSession } from "telegram/sessions";
import { Logger } from "telegram/extensions";
import { TelegramClient } from "telegram";

import config from "../config";

const stringSession = new StringSession(process.env.SESSION);

if (!config.TELEGRAM_API_ID || !config.TELEGRAM_API_HASH) throw new Error("");

const telegramClient = new TelegramClient(
  stringSession,
  +config.TELEGRAM_API_ID,
  config.TELEGRAM_API_HASH,
  {
    connectionRetries: 5,
    baseLogger: new Logger("warn"),
  }
);

export default telegramClient;
