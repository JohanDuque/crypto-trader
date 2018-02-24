const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');
const util = require('util');

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
                    Logger.log(3, "\nOrder Book:\n" + util.inspect(data, { depth: 2 }) + "\n");

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
                    gb.lastBuySpeed = gb.currentBuySpeed ? gb.currentBuySpeed : 1;
                    gb.lastSellSpeed = gb.currentSellSpeed ? gb.currentSellSpeed : 1;

                    Logger.log(3, "\nTrade History:\n" + util.inspect(data, { depth: 2 }) +"\n");

                    gb.tradeHistory = data;
                    gb.currentSellers = data.filter(data => data.side === conf.BUY).length;
                    gb.currentBuyers = data.filter(data => data.side === conf.SELL).length;
                    gb.currentMarketPrice = Number(data[0].price);
                    gb.lowestTradePrice= gb.currentMarketPrice < gb.lowestTradePrice ? gb.lowestTradePrice : gb.currentMarketPrice ;
                    gb.hightestTradePrice= gb.currentMarketPrice > gb.hightestTradePrice ? gb.hightestTradePrice : gb.currentMarketPrice ;

                    Logger.log(2, 'Current Buyers: ' + gb.currentBuyers);
                    Logger.log(2, 'Current Sellers: ' + gb.currentSellers);
                    Logger.log(2, 'Current Market Price: ' + gb.currentMarketPrice);

                    gb.currentBuySpeed = gb.currentSellers ? (gb.currentBuyers / gb.currentSellers) : gb.currentBuyers;
                    Logger.log(2, 'Current BUY Speed (Buyers/Sellers): ' + gb.currentBuySpeed);
                    Logger.log(2, 'Last BUY Speed (Buyers/Sellers): ' + gb.lastBuySpeed);

                    gb.currentSellSpeed = gb.currentBuyers ? (gb.currentSellers / gb.currentBuyers) : gb.currentSellers;
                    Logger.log(2, 'Current SELL Speed (Sellers/Buyers): ' + gb.currentSellSpeed);
                    Logger.log(2, 'Last SELL Speed (Sellers/Buyers): ' + gb.lastSellSpeed);

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