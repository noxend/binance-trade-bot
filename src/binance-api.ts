import qs from "qs";
import WebSocket from "ws";
import axios, { AxiosRequestConfig } from "axios";
import { createHmac } from "crypto";

const fapi = "https://fapi.binance.com/fapi/";
const fstream = "wss://fstream.binance.com/ws/";

type Symbol = "BTCUSDT" | "ETHUSDT";

type OrderSide = "BUY" | "SELL";

type OrderType =
  | "LIMIT"
  | "MARKET"
  | "STOP"
  | "STOP_MARKET"
  | "TAKE_PROFIT"
  | "TAKE_PROFIT_MARKET"
  | "TRAILING_STOP_MARKET";

type PositionSide = "BOTH" | "LONG" | "SHORT";

type TimeInForce = "GTC" | "IOC" | "FOK" | "GTX";

type Asset = "BNB" | "BUSD" | "USDT";

type OrderUpdate = {
  s: Symbol;
  c: string; // Client order id
  S: OrderSide;
  o: OrderType;
  f: TimeInForce; // Time in force
  q: string; // Original quantity
  p: string; // Original price
  ap: string; // Average Price
  sp: string; // Stop Price
  x: string; // Execution Type
  X: string; // Order Status
  ps: PositionSide;
  ot: OrderType;
  rp: string; // Realized Profit
};

const ORDER_TRADE_UPDATE = "ORDER_TRADE_UPDATE";
const ACCOUNT_UPDATE = "ACCOUNT_UPDATE";

type Update = {
  E: number; // Event time
  T: number; // Transaction Time
} & (
  | {
      e: typeof ORDER_TRADE_UPDATE;
      o: OrderUpdate;
    }
  | { e: typeof ACCOUNT_UPDATE; a: any }
);

interface AccountBalanceAsset {
  accountAlias: string;
  asset: Asset;
  balance: string;
  crossWalletBalance: string;
  crossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  marginAvailable: boolean;
  updateTime: number;
}

interface Default {
  timestamp: number;
  signature: string;
}

interface FuturesNewOrderParams {
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
  stopPrice?: number;
  quantity: number;
  symbol: Symbol;
  side: OrderSide;
  type: OrderType;
}

export default class BinanceApi {
  public constructor(private apiKey: string, private secretKey: string) {}

  public async privateRequest(
    url: string,
    base: string,
    params: any = {},
    axiosConfig: AxiosRequestConfig = {}
  ) {
    params.timestamp = Date.now();
    params.signature = createHmac("sha256", this.secretKey)
      .update(qs.stringify(params))
      .digest("hex");

    const query = qs.stringify(params, { addQueryPrefix: true });

    try {
      const { data } = await axios({
        headers: {
          "X-MBX-APIKEY": this.apiKey,
        },
        url: `${base}${url}${query}`,
        method: "GET",
        ...axiosConfig,
      });

      return data;
    } catch (error) {
      console.log(error.response.data);
    }
  }

  public async publicRequest(
    url: string,
    base: string,
    params: any = {},
    axiosConfig: AxiosRequestConfig = {}
  ) {
    const query = qs.stringify(params, { addQueryPrefix: true });

    try {
      const { data } = await axios({
        url: `${base}${url}${query}`,
        method: "GET",
        ...axiosConfig,
      });

      return data;
    } catch (error) {
      console.log(error.response.data);
    }
  }

  public futuresPing() {
    return this.privateRequest("v1/ping", fapi);
  }

  public futuresServerTime() {
    return this.privateRequest("v1/time", fapi);
  }

  public futuresAccountBalance(): Promise<AccountBalanceAsset[]> {
    return this.privateRequest("v2/balance", fapi);
  }

  public futuresNewOrder(params: FuturesNewOrderParams) {
    return this.privateRequest("v1/order", fapi, params, { method: "POST" });
  }

  public futuresExchangeInfo() {
    return this.privateRequest("v1/exchangeInfo", fapi);
  }

  public futuresSymbolPriceTicker(symbol: Symbol) {
    return this.publicRequest("v1/ticker/price", fapi, { symbol });
  }

  public futuresStartDataStream() {
    return this.privateRequest("v1/listenKey", fapi, {}, { method: "POST" });
  }

  public futuresKeepDataStream() {
    return this.privateRequest("v1/listenKey", fapi, {}, { method: "PUT" });
  }

  public futuresDeleteDataStream() {
    return this.privateRequest("v1/listenKey", fapi, {}, { method: "DELETE" });
  }

  public futuresSubscribeToUpdates(listenKey: string, cb: (update: Update) => void): WebSocket {
    const ws = new WebSocket(`${fstream}${listenKey}`);

    ws.on("error", (error) => {
      console.error(`WebSocket error: ${error.message}`);
    });

    ws.on("message", (data) => {
      try {
        cb(JSON.parse(data.toString()));
      } catch (error) {
        console.log(`Parse error: ${error.message}`);
      }
    });

    ws.on("open", () => {
      console.info("WebSocket has been connected");
    });

    return ws;
  }

  public async getSymbolInfo(symbol: Symbol) {
    const { symbols } = await this.futuresExchangeInfo();
    return (<any[]>symbols).find((item) => item.symbol === symbol);
  }

  public async getAssetInfo(asset: Asset) {
    const { assets } = await this.futuresExchangeInfo();
    return (<any[]>assets).find((item) => item.asset === asset);
  }

  public async getFuturesAccountBalanceByAsset(
    asset: Asset
  ): Promise<AccountBalanceAsset | undefined> {
    const data = await this.futuresAccountBalance();
    return data.find((item) => item.asset === asset);
  }
}
