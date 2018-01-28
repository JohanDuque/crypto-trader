const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');

class Trader {

    isThisFirstTrade() {
        return gb.sellOrders === gb.buyOrders &&
            gb.buyOrders === gb.fills &&
            gb.fills === gb.lastSellPrice &&
            gb.lastSellPrice === gb.lastBuyPrice &&
            gb.lastBuyPrice === 0;
    };

    isRatioIncreasing() { return gb.currentIterationRatio > gb.lastIterationRatio }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }

    placeSellOrder(price) {
        gb.sellOrders++;
        gb.lastSellPrice = price;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        Logger.log(1, "\n+++++ Placing Sell Order at: " + price + "(" + conf.toCurrency + ") +++++ Sell Orders: " + gb.sellOrders);
        Logger.printReport();
    }

    placeSellOrderAtCurrentMarketPrice() {
        this.placeSellOrder(gb.currentMarketPrice);
    }

    placeBuyOrder(price) {
        gb.buyOrders++;
        gb.lastBuyPrice = price;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(price);
        gb.lastOrderWasFilled = false;

        Logger.log(1, "\n----- Placing Buy Order at: " + price + "(" + conf.toCurrency + ") ----- Buy Orders: " + gb.buyOrders);
        Logger.printReport();
    }

    placeBuyOrderAtCurrentMarketPrice() {
        this.placeBuyOrder(gb.currentMarketPrice);
    }

    removeLastSellOrder() {
        gb.sellOrders--;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(gb.lastSellPrice);
        gb.lastOrderWasFilled = true;

        Logger.log(1, "\n----- Removing Last SELL Order ----");
        Logger.printReport();

    }

    removeLastBuyOrder() {
        gb.buyOrders--;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(gb.lastBuyPrice);
        gb.lastOrderWasFilled = false;

        Logger.log(1, "\n+++++ Removing Last BUY Order ----");
        Logger.printReport();
    }

    improveSellAverage() { return (gb.asksAverage + gb.currentMarketPrice) / 2; }
    improveBuyAverage() { return (gb.bidsAverage + gb.currentMarketPrice) / 2; }

    placeImprovedSellOrder() { this.placeSellOrder(this.improveSellAverage()); }
    placeImprovedBuyOrder() { this.placeBuyOrder(this.improveBuyAverage()); }

    calculateTransactionAmount(price) {
        return price * conf.orderSize;
    }
}

module.exports = new Trader();