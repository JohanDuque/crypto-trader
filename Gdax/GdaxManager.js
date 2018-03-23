const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Logger = require('../commons/Logger');
const ExchangeManager = require('../actors/ExchangeManager');
const util = require('util');

const Gdax = require('gdax');
const GdaxAuthenticator = require('./GdaxAuthenticator');

const publicClient = new Gdax.PublicClient();

const authedClient = new Gdax.AuthenticatedClient(
    GdaxAuthenticator.key,
    GdaxAuthenticator.secret,
    GdaxAuthenticator.passphrase,
    GdaxAuthenticator.apiURI
);

const ETH_ID = GdaxAuthenticator.ETH_ACCOUNT_ID;

class GdaxManager extends ExchangeManager {

    placeOrder(params) {
        return new Promise(function (resolve, reject) {
            authedClient.placeOrder(params)
                .then(data => {
                    Logger.log(3, 'Place Order:');
                    Logger.log(1, data);
                    gb.lastOrderId = data.id;
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    cancelOrder(orderId) {
        return new Promise(function (resolve, reject) {
            authedClient.cancelOrder(orderId)
                .then(data => {
                    Logger.log(1, '\nOrder: ' + orderId + ' has been canceled');
                    Logger.log(1, data);
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getFills() {
        return new Promise(function (resolve, reject) {
            authedClient.getFills()
                .then(data => {
                    Logger.log(3, 'Fills:');
                    Logger.log(3, data);

                    if (!gb.lastOrderWasFilled) {
                        const lastFilledOrder = data.find(function (element) {
                            return element.order_id === gb.lastOrderId;
                        });

                        gb.lastOrderWasFilled = lastFilledOrder != undefined && lastFilledOrder.order_id === gb.lastOrderId;

                        if (gb.lastOrderWasFilled) {
                            gb.fills++;
                            Logger.printReport();
                        }
                    }
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getCoinbaseAccounts() {
        return new Promise(function (resolve, reject) {
            authedClient.getCoinbaseAccounts()
                .then(data => {
                    Logger.log(3, 'Coinbase Accounts:');
                    Logger.log(3, data);
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getAccounts() {
        return new Promise(function (resolve, reject) {
            authedClient.getAccounts()
                .then(data => {
                    Logger.log(3, 'Accounts:');
                    Logger.log(3, data);
                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getAccount() {
        return new Promise(function (resolve, reject) {
            authedClient.getAccount(ETH_ID)
                .then(data => {
                    Logger.log(3, 'Account:');
                    Logger.log(3, data);

                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getAccountHistory() {
        return new Promise(function (resolve, reject) {
            // For pagination, you can include extra page arguments
            authedClient.getAccountHistory(ETH_ID, {before: 3000})
                .then(data => {
                    Logger.log(3, 'Account History:');
                    Logger.log(3, data);

                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getOrderBook() {
        const exchange = this;
        return new Promise(function (resolve, reject) {
            publicClient.getProductOrderBook(conf.productType, {level: 2})//level 2 means 50 buys & 50 sells
                .then(data => {
                    Logger.log(3, "\nOrder Book:\n" + util.inspect(data, {depth: 2}) + "\n");
                    gb.orderBook = data;
                    exchange.elaborateOrderBook();

                    resolve();
                })
                .catch(error => {
                    //TODO handle error
                    gb.errorCount++;
                    Logger.log(1, error);
                    reject();
                });
        });
    }

    getTradeHistory() {
        const exchange = this;
        return new Promise(function (resolve, reject) {
            publicClient.getProductTrades(conf.productType, {limit: 50})
                .then(data => {
                    Logger.log(3, "\nTrade History:\n" + util.inspect(data, {depth: 2}) + "\n");
                    gb.tradeHistory = data;

                    exchange.elaborateTradeHistory();
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