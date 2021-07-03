import qs from "qs";
import axios, { AxiosRequestConfig } from "axios";
import { createHmac } from "crypto";

const fapi = "https://fapi.binance.com/fapi/";

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

  public async makeApiCall(
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

  public futuresPing = () => this.makeApiCall("v1/ping", fapi);

  public futuresServerTime = () => this.makeApiCall("v1/time", fapi);

  public futuresAccountBalance = (): Promise<AccountBalanceAsset[]> =>
    this.makeApiCall("v2/balance", fapi);

  public futuresNewOrder = (params: FuturesNewOrderParams) =>
    this.makeApiCall("v1/order", fapi, params, { method: "POST" });

  public futuresExchangeInfo = () => this.makeApiCall("v1/exchangeInfo", fapi);

  public futuresSymbolPriceTicker = (symbol: Symbol) =>
    this.publicRequest("v1/ticker/price", fapi, { symbol });

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
