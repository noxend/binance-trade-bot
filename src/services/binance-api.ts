import BinanceApi from "../binance-api";
import config from "../config";

if (!config.BINANCE_API_KEY || !config.BINANCE_SECRET_KEY) throw new Error("");

export default new BinanceApi(config.BINANCE_API_KEY, config.BINANCE_SECRET_KEY);
