const Gdax = require('gdax');
const C = require('./Constants');
const lodash = require('lodash');
let Conf;
module.exports = class GdaxManager {
    constructor(params) {
        Conf = params.conf;
        this.account = params.account;
        this.publicClient = new Gdax.PublicClient();
        this.bidsAverage = null;
        this.marketCanSellAt = null;
        this.asksAverage = null;
        this.marketCanBuyAt = null;
        this.currentMarketPrice = null;
        this.buys = null;
        this.sells = null;
        this.tradeHistory = {};
        this.errors = 0;
    }

    getAverage(items) {
        if (Conf.tradeSampleSize > 0) {
            items = items.slice(0, Conf.tradeSampleSize);
        }
        var sumItems = items.reduce((accumulator, item) => {
            return accumulator + parseInt(item[0]);
        }, 0);
        return sumItems / items.length;
    }

    askForInfo() {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.publicClient.getProductOrderBook(Conf.productType, { level: 2 })
                .then(data => {
                    if (data) {
                        me.bidsAverage = me.getAverage(data.bids);
                        me.marketCanBuyAt = data.bids[0][0];
                        me.asksAverage = me.getAverage(data.asks);
                        me.marketCanSellAt = data.asks[0][0];
                    }
                    return me.publicClient.getProductTicker(Conf.productType);
                })
                .then(data => {
                    if (data) {
                        me.currentMarketPrice = Number(data.price);
                    }
                    return me.publicClient.getProductTrades(Conf.productType, { limit: Conf.tradeSampleSize })
                })
                .then(allData => {
                    if (allData) {
                        me.tradeHistory = allData;
                        me.buys = allData.filter(data => data.side === C.BUY).length;
                        me.sells = allData.filter(data => data.side === C.SELL).length;
                    }
                    if (Conf.verbose) {
                        console.log("[GDAX MANAGER] Trade History:");
                        console.log(allData);
                        console.log("\n");
                    }
                    resolve();
                })
                .catch(error => {
                    console.error("[GDAX MANAGER] .... handle the error");
                    me.errors++;
                    if(Conf.verbose)console.log(error);
                    reject(error);
                });
        });
    }


    getOrderBook() {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.publicClient.getProductOrderBook(Conf.productType, { level: 2 })
                .then(data => {
                    if (Conf.verbose) {
                        console.log("[GDAX MANAGER] Order Book:");
                        console.log(data);
                        console.log("\n");
                    }

                    me.bidsAverage = getAverage(data.bids);
                    me.asksAverage = getAverage(data.asks);

                    if (Conf.verbose) {
                        console.log("[GDAX MANAGER] Bids Average: " + me.bidsAverage + '');
                        console.log("[GDAX MANAGER] Asks Average: " + me.asksAverage + '');
                    }
                })
                .catch(error => {
                    //TODO handle error
                    me.errors++;
                    if (Conf.verbose) console.log('[GDAX MANAGER] ',error);
                });
        });
    }


    gdaxTime() {
        console.log('[GDAX MANAGER] getTime');
        this.publicClient.getTime()
            .then(data => {
                //console.log("getTime()");
                //console.log(data);
            })
            .catch(error => {
                console.error("[GDAX MANAGER] .... handle the error");
                console.log(error);
            });
    }

    

}