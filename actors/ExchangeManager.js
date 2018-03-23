const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Logger = require('../commons/Logger');

class ExchangeManager {
    placeOrder(params) {
        throw new Error('You have to implement this method!');
    }

    cancelOrder(orderId) {
        throw new Error('You have to implement this method!');
    }

    getFills() {
        throw new Error('You have to implement this method!');
    }

    getAccounts() {
        throw new Error('You have to implement this method!');
    }

    getAccount() {
        throw new Error('You have to implement this method!');
    }


    getAccountHistory() {
        throw new Error('You have to implement this method!');
    }

    getOrderBook() {
        throw new Error('You have to implement this method!');
    }

    getTradeHistory() {
        throw new Error('You have to implement this method!');
    }

    elaborateTradeHistory() {
        const resizedHistory = gb.tradeHistory.slice(0, conf.tradeHistorySize);

        gb.lastBuySpeed = gb.currentBuySpeed ? gb.currentBuySpeed : 1;
        gb.lastSellSpeed = gb.currentSellSpeed ? gb.currentSellSpeed : 1;

        gb.currentSellers = resizedHistory.filter(elem => elem.side === conf.BUY).length;
        gb.currentBuyers = resizedHistory.filter(elem => elem.side === conf.SELL).length;
        gb.currentMarketPrice = Number(resizedHistory[0].price);

        Logger.log(2, 'Current Buyers: ' + gb.currentBuyers);
        Logger.log(2, 'Current Sellers: ' + gb.currentSellers);
        Logger.log(2, 'Current Market Price: ' + gb.currentMarketPrice);

        gb.currentBuySpeed = gb.currentSellers ? (gb.currentBuyers / gb.currentSellers) : gb.currentBuyers;
        Logger.log(2, 'Current BUY Speed (Buyers/Sellers): ' + gb.currentBuySpeed);
        Logger.log(2, 'Last BUY Speed (Buyers/Sellers): ' + gb.lastBuySpeed);

        gb.currentSellSpeed = gb.currentBuyers ? (gb.currentSellers / gb.currentBuyers) : gb.currentSellers;
        Logger.log(2, 'Current SELL Speed (Sellers/Buyers): ' + gb.currentSellSpeed);
        Logger.log(2, 'Last SELL Speed (Sellers/Buyers): ' + gb.lastSellSpeed);
    }

    elaborateOrderBook() {
        //TODO calculate average based on a configurable parameter
        gb.bidsAverage = this.getAverage(gb.orderBook.bids);
        gb.asksAverage = this.getAverage(gb.orderBook.asks);

        Logger.log(2, "Bids Average: " + gb.bidsAverage + '');
        Logger.log(2, "Asks Average: " + gb.asksAverage + '');
    }

    getAverage(items) {
        let sumItems = items.reduce((accumulator, item) => {
            //"item": [ price, size, num-orders ]
            return accumulator + parseInt(item[0]);
        }, 0);
        return sumItems / items.length;
    }
}

module.exports = ExchangeManager;