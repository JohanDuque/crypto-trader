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
        if (conf.simulateFromRecording) {
            this.onSellOrderPlaced(price);
        } else {
            this.placeOrderOnExchange(price, conf.SELL).then(() => {
                this.onSellOrderPlaced(price);
            }, err => {
                //TODO handle error
                gb.errorCount++;
                Logger.log(1, err);
            });
        }
    }

    onSellOrderPlaced(price) {
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

    placeSellOrderCloseToCurrentMarketPrice() {
        this.placeSellOrder(gb.currentMarketPrice);//TODO
    }

    placeBuyOrder(price) {
        if (conf.simulateFromRecording) {
            this.onBuyOrderPlaced(price);
        } else {
            this.placeOrderOnExchange(price, conf.BUY).then(() => {
                this.onBuyOrderPlaced(price);
            }, err => {
                //TODO handle error
                gb.errorCount++;
                Logger.log(1, err);
            });
        }
    }

    onBuyOrderPlaced(price) {
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

    placeBuyOrderCloseToCurrentMarketPrice() {
        this.placeBuyOrder(gb.currentMarketPrice);//TODO
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
            post_only: true
        };

        return Promise.all([
            GdaxManager.placeOrder(params)
        ]);
    }
}

module.exports = new Trader();