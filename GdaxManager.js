const Gdax = require('gdax');
const C = require('./Constants');
module.exports = class GdaxManager {
    constructor() {
        this.publicClient = new Gdax.PublicClient();
        this.buyAverage = null;
        this.marketCanSellAt = null;
        this.sellAverage = null;
        this.marketCanBuyAt = null;
        this.currentPrice = null;
        this.buys = null;
        this.sells = null;
    }

    getAverage(bids) {
        bids = bids.slice(0, 10);
        var sumBids = bids.reduce((accumulator, bid) => {
            return accumulator + parseInt(bid[0]);
        }, 0);
        return sumBids / bids.length;
    }

    askForInfo() {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.publicClient.getProductOrderBook('ETH-EUR', { level: 2 })
                .then(data => {
                    if (data) {
                        me.buyAverage = me.getAverage(data.bids);
                        me.marketCanBuyAt = data.bids[0][0];
                        me.sellAverage = me.getAverage(data.asks);
                        me.marketCanSellAt = data.asks[0][0];
                    }
                    return me.publicClient.getProductTicker('ETH-EUR');
                })
                .then(data => {
                    if (data) {
                        if (me.currentPrice !== data.price) {
                            me.currentPrice = data.price;
                            //console.log("Current Price: " + me.currentPrice);
                        }
                    }
                    return me.publicClient.getProductTrades('ETH-EUR', { limit: 10 })
                })
                .then(allData => {
                    if (allData) {
                        me.buys = allData.filter(data => data.side === C.BUY).length;
                        me.sells = allData.filter(data => data.side === C.SELL).length;
                    }
                    resolve();
                })
                .catch(error => {
                    console.error(".... handle the error");
                    console.log(error);
                    reject(error);
                });
        });
    }


    gdaxTime() {
        console.log('getTime');
        this.publicClient.getTime()
            .then(data => {
                //console.log("getTime()");
                //console.log(data);
            })
            .catch(error => {
                console.error(".... handle the error");
                console.log(error);
            });
    }
}