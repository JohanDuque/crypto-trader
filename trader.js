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

        Logger.log(1, "\n+++++ Placing Sell Order at: " + price + "(" + conf.toCurrency + ") +++++ Sell Orders: " + gb.sellOrders);
        Logger.printReport();
    };

    placeBuyOrder(price) {
        gb.buyOrders++;
        gb.lastBuyPrice = price;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        Logger.log(1, "\n----- Placing Buy Order at: " + price + "(" + conf.toCurrency + ") ----- Buy Orders: " + gb.buyOrders);
        Logger.printReport();
    };

    removeLastSellOrder() {
        gb.sellOrders--;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(gb.lastSellPrice);
        gb.lastOrderWasFilled = true;

        Logger.log(1, "\n----- Removing Last SELL Order ----");
        Logger.printReport();

    };

    removeLastBuyOrder() {
        gb.buyOrders--;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(gb.lastBuyPrice);
        gb.lastOrderWasFilled = false;

        Logger.log(1, "\n+++++ Removing Last BUY Order ----");
        Logger.printReport();
    };

    calculateTransactionAmount(price) {
        return price * conf.orderSize;
    };
}

module.exports = new Trader();