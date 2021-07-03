import binance from "./services/binance-api";

binance.futuresStartDataStream().then(({ listenKey }) => {
  binance.futuresSubscribeToUpdates(listenKey, (update) => {
    update.e === 'ORDER_TRADE_UPDATE'
  });
});
