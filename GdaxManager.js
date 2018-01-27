const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');

const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

class GdaxManager {

    getAverage(items) {
        let sumItems = items.reduce((accumulator, item) => {
            //"item": [ price, size, num-orders ] 
            return accumulator + parseInt(item[0]);
        }, 0);
        return sumItems / items.length;
    };

    getOrderBook() {
        var me = this;
        return new Promise(function(resolve, reject) {
            publicClient.getProductOrderBook(conf.productType, { level: 2 })
                .then(data => {
                    if (conf.logLvl >= 3) {
                        Logger.log("Order Book:");
                        Logger.log(data);
                        Logger.log("\n");
                    }

                    gb.bidsAverage = me.getAverage(data.bids);
                    gb.asksAverage = me.getAverage(data.asks);

                    if (conf.logLvl >= 2) {
                        Logger.log("Bids Average: " + gb.bidsAverage + '');
                        Logger.log("Asks Average: " + gb.asksAverage + '');
                    }
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    if (conf.logLvl >= 4) Logger.log(error);

                    reject();
                });
        });
    };

    getTradeHistory() {
        return new Promise(function(resolve, reject) {
            publicClient.getProductTrades(conf.productType, { limit: conf.tradeHistorySize })
                .then(data => {
                    if (conf.logLvl >= 3) {
                        Logger.log("Trade History:");
                        Logger.log(data);
                        Logger.log("\n");
                    }

                    gb.tradeHistory = data;
                    gb.currentSellers = data.filter(data => data.side === conf.BUY).length;
                    gb.currentBuyers = data.filter(data => data.side === conf.SELL).length;
                    gb.currentMarketPrice = Number(data[0].price);

                    if (conf.logLvl >= 2) {
                        Logger.log('Current Buyers: ' + gb.currentBuyers);
                        Logger.log('Current Sellers: ' + gb.currentSellers);
                        Logger.log('Current Market Price from History: ' + data[0].price);
                    }
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    if (conf.logLvl >= 4) Logger.log(error);
                    reject();
                });
        });
    };
}

module.exports = new GdaxManager();