const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const GdaxManager = require('./GdaxManager');
const Logger = require('./Logger');

class Trader {

    isThisFirstTrade() {
        return gb.sellOrders === gb.buyOrders &&
            gb.buyOrders === gb.fills &&
            gb.fills === gb.lastSellPrice &&
            gb.lastSellPrice === gb.lastBuyPrice &&
            gb.lastBuyPrice === 0;
    }

    placeSellOrder(price) {
        this.placeOrderOnExchange(price, conf.SELL).then(() => {
            gb.sellOrders++;
            gb.lastSellPrice = price;
            gb.lastAction = conf.SELL;
            gb.profits += this.calculateTransactionAmount(price);
            gb.lastOrderWasFilled = false;

            Logger.log(1, "\n+++++ Placing Sell Order at: " + price + "(" + conf.toCurrency + ") +++++ Sell Orders: " + gb.sellOrders);
            Logger.printReport();
        }, err => {
            //TODO handle error
            gb.errorCount++;
            Logger.log(1, err);
        });
    }

    placeSellOrderAtCurrentMarketPrice() {
        this.placeSellOrder(gb.currentMarketPrice);
    }

    placeBuyOrder(price) {
        this.placeOrderOnExchange(price, conf.BUY).then(() => {
            gb.buyOrders++;
            gb.lastBuyPrice = price;
            gb.lastAction = conf.BUY;
            gb.profits -= this.calculateTransactionAmount(price);
            gb.lastOrderWasFilled = false;

            Logger.log(1, "\n----- Placing Buy Order at: " + price + "(" + conf.toCurrency + ") ----- Buy Orders: " + gb.buyOrders);
            Logger.printReport();
        }, err => {
            //TODO handle error
            gb.errorCount++;
            Logger.log(1, err);
        });

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
    }

    removeLastBuyOrder() {
        gb.buyOrders--;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(gb.lastBuyPrice);
        gb.lastOrderWasFilled = false;

        Logger.log(1, "\n+++++ Removing Last BUY Order ----");
    }

    improveSellAverage() { return (gb.asksAverage + gb.currentMarketPrice) / 2; }
    improveBuyAverage() { return (gb.bidsAverage + gb.currentMarketPrice) / 2; }

    placeImprovedSellOrder() { this.placeSellOrder(this.improveSellAverage()); }
    placeImprovedBuyOrder() { this.placeBuyOrder(this.improveBuyAverage()); }

    calculateTransactionAmount(price) {
        return price * conf.orderSize;
    }

    placeOrderOnExchange(price, side) {
        const params = {
            side: side,
            price: price,
            size: conf.orderSize,
            product_id: conf.productType,
        };

        return Promise.all([
            GdaxManager.placeOrder(params)
        ]);
    }

}

module.exports = new Trader();