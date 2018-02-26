const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');
const util = require('util');

const GdaxAuthenticator = require('./GdaxAuthenticator');

const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

const authedClient = new Gdax.AuthenticatedClient(
    GdaxAuthenticator.key,
    GdaxAuthenticator.secret,
    GdaxAuthenticator.passphrase,
    GdaxAuthenticator.apiURI
);

const ETH_ID = GdaxAuthenticator.ETH_ACCOUNT_ID;

class GdaxManager {

    getCoinbaseAccounts() {
        return new Promise(function(resolve, reject) {
            authedClient.getCoinbaseAccounts()
                .then(data => {
                    console.log('Coinbase Accounts:');
                    console.log(data);

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

    getAccounts() {
        return new Promise(function(resolve, reject) {
            authedClient.getAccounts()
                .then(data => {

                    console.log('Accounts:');
                    console.log(data);

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

    getAccount() {
        return new Promise(function(resolve, reject) {
            authedClient.getAccount(ETH_ID)
                .then(data => {
                    console.log('Account:');
                    console.log(data);

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

    getAccountHistory() {
        return new Promise(function(resolve, reject) {
            // For pagination, you can include extra page arguments
            authedClient.getAccountHistory(ETH_ID, { before: 3000 })
                .then(data => {
                    console.log('Account History:');
                    console.log(data);

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

                    Logger.log(3, "\nTrade History:\n" + util.inspect(data, { depth: 2 }) + "\n");

                    gb.tradeHistory = data;
                    gb.currentSellers = data.filter(data => data.side === conf.BUY).length;
                    gb.currentBuyers = data.filter(data => data.side === conf.SELL).length;
                    gb.currentMarketPrice = Number(data[0].price);
                    gb.lowestTradePrice = gb.currentMarketPrice < gb.lowestTradePrice ? gb.currentMarketPrice : gb.lowestTradePrice;
                    gb.hightestTradePrice = gb.currentMarketPrice > gb.hightestTradePrice ? gb.currentMarketPrice : gb.hightestTradePrice;
                    gb.totalAmoutTraded = gb.hightestTradePrice - gb.lowestTradePrice;

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