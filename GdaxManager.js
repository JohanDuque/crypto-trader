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
    }

    getOrderBook() {
        var me = this;
        return new Promise(function(resolve, reject) {
            publicClient.getProductOrderBook(conf.productType, { level: 2 })
                .then(data => {
                    Logger.log(3, "Order Book:\n" + data + "\n");

                    gb.bidsAverage = me.getAverage(data.bids);
                    gb.asksAverage = me.getAverage(data.asks);

                    Logger.log(2, "Bids Average: " + gb.bidsAverage + '');
                    Logger.log(2, "Asks Average: " + gb.asksAverage + '');

                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(4, error);
                    reject();
                });
        });
    }

    getTradeHistory() {
        return new Promise(function(resolve, reject) {
            publicClient.getProductTrades(conf.productType, { limit: conf.tradeHistorySize })
                .then(data => {
                    gb.lastMarketVelocity = gb.currentMarketVelocity ? gb.currentMarketVelocity : 1;

                    Logger.log(3, "Trade History:\n" + data + "\n");

                    gb.tradeHistory = data;
                    gb.currentSellers = data.filter(data => data.side === conf.BUY).length;
                    gb.currentBuyers = data.filter(data => data.side === conf.SELL).length;
                    gb.currentMarketPrice = Number(data[0].price);

                    Logger.log(2, 'Current Buyers: ' + gb.currentBuyers);
                    Logger.log(2, 'Current Sellers: ' + gb.currentSellers);
                    Logger.log(2, 'Current Market Price: ' + data[0].price);

                    gb.currentMarketVelocity = gb.currentSellers ? (gb.currentBuyers / gb.currentSellers) : gb.currentBuyers;
                    Logger.log(2, 'Current Market Velocity (Buyers/Sellers): ' + gb.currentMarketVelocity);
                    Logger.log(2, 'Last Market Velocity (Buyers/Sellers): ' + gb.lastMarketVelocity);

                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    if (conf.logLvl >= 4) Logger.log(error);
                    reject();
                });
        });
    }
}

module.exports = new GdaxManager();