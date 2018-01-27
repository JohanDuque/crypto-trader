const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');

class Trader {
    doSell(price) {
        gb.sellOrders++;
        gb.lastSellPrice = price;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        if (conf.logLvl >= 1) Logger.log("\n+++++ Placing Sell Order at: " + price + "(" + conf.toCurrency + ") +++++ Sell Orders: " + gb.sellOrders);
        if (conf.logLvl >= 0) Logger.printReport();
    }

    doBuy(price) {
        gb.buyOrders++;
        gb.lastBuyPrice = price;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        if (conf.logLvl >= 1) Logger.log("\n----- Placing Buy Order at: " + price + "(" + conf.toCurrency + ") ----- Buy Orders: " + gb.buyOrders);
        if (conf.logLvl >= 0) Logger.printReport();
    }

    calculateTransactionAmount(price) {
        return price * conf.orderSize;
    }
}

module.exports = new Trader();