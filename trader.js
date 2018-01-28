const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');

class Trader {
    placeSellOrder(price) {
        gb.sellOrders++;
        gb.lastSellPrice = price;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        if (conf.logLvl >= 1) Logger.log("\n+++++ Placing Sell Order at: " + price + "(" + conf.toCurrency + ") +++++ Sell Orders: " + gb.sellOrders);
        if (conf.logLvl >= 0) Logger.printReport();
    };

    placeBuyOrder(price) {
        gb.buyOrders++;
        gb.lastBuyPrice = price;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        if (conf.logLvl >= 1) Logger.log("\n----- Placing Buy Order at: " + price + "(" + conf.toCurrency + ") ----- Buy Orders: " + gb.buyOrders);
        if (conf.logLvl >= 0) Logger.printReport();
    };

    removeLastSellOrder() {
        gb.sellOrders--;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(gb.lastSellPrice);
        gb.lastOrderWasFilled = true;

        if (conf.logLvl >= 1) Logger.log("\n----- Removing Last SELL Order ----");
        if (conf.logLvl >= 0) Logger.printReport();

    };

    removeLastBuyOrder() {
        gb.buyOrders--;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(gb.lastBuyPrice);
        gb.lastOrderWasFilled = false;

        if (conf.logLvl >= 1) Logger.log("\n+++++ Removing Last BUY Order ----");
        if (conf.logLvl >= 0) Logger.printReport();
    };

    calculateTransactionAmount(price) {
        return price * conf.orderSize;
    };
}

module.exports = new Trader();