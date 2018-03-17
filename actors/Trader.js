const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Exchange = require('../actors/Exchange');
const Logger = require('../commons/Logger');

class Trader {

    isThisFirstTrade() {
        return gb.sellOrders === gb.buyOrders &&
            gb.buyOrders === gb.fills &&
            gb.fills === gb.lastSellPrice &&
            gb.lastSellPrice === gb.lastBuyPrice &&
            gb.lastBuyPrice === 0;
    }

    placeSellOrder(price) {
        const newPrice = this.precisionRound(price, 2);
        if (conf.simulateFromRecording) {
            this.onSellOrderPlaced(newPrice);
        } else {
            this.placeOrderOnExchange(newPrice, conf.SELL).then(() => {
                this.onSellOrderPlaced(newPrice);
            }).catch(err => {
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

        Logger.log(1, "\n+++++ Placed Sell Order at: " + price + "(" + conf.toCurrency + ") +++++ Sell Orders: " + gb.sellOrders);
        Logger.printReport();
    }

    placeSellOrderAtCurrentMarketPrice() {
        this.placeSellOrder(gb.currentMarketPrice);
    }

    placeSellOrderCloseToCurrentMarketPrice() {
        const closePrice = gb.currentMarketPrice + (gb.currentMarketPrice * conf.postOnlyFactor);
        this.placeSellOrder(closePrice);
    }

    placeBuyOrder(price) {
        const newPrice = this.precisionRound(price, 2);
        if (conf.simulateFromRecording) {
            this.onBuyOrderPlaced(newPrice);
        } else {
            this.placeOrderOnExchange(newPrice, conf.BUY).then(() => {
                this.onBuyOrderPlaced(newPrice);
            }).catch(err => {
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

        Logger.log(1, "\n----- Placed Buy Order at: " + price + "(" + conf.toCurrency + ") ----- Buy Orders: " + gb.buyOrders);
        Logger.printReport();
    }

    placeBuyOrderAtCurrentMarketPrice() {
        this.placeBuyOrder(gb.currentMarketPrice);
    }

    placeBuyOrderCloseToCurrentMarketPrice() {
        const closePrice = gb.currentMarketPrice - (gb.currentMarketPrice * conf.postOnlyFactor);
        this.placeBuyOrder(closePrice);
    }

    removeLastSellOrder() {
        if (conf.simulateFromRecording) {
            this.onRemoveLastSellOrder();
        } else {
            this.cancelLastOrder().then(() => {
                this.onRemoveLastSellOrder();
            }).catch(err => {
                //TODO handle error
                gb.errorCount++;
                Logger.log(1, err);
            });
        }
    }

    onRemoveLastSellOrder() {
        gb.sellOrders--;
        gb.lastAction = conf.BUY;
        gb.profits -= this.calculateTransactionAmount(gb.lastSellPrice);

        Logger.log(1, "\n----- Last SELL Order has been removed ----");
    }

    removeLastBuyOrder() {
        if (conf.simulateFromRecording) {
            this.onRemoveLastBuyOrder();
        } else {
            this.cancelLastOrder().then(() => {
                this.onRemoveLastBuyOrder();
            }).catch(err => {
                //TODO handle error
                gb.errorCount++;
                Logger.log(1, err);
            });
        }
    }

    onRemoveLastBuyOrder() {
        gb.buyOrders--;
        gb.lastAction = conf.SELL;
        gb.profits += this.calculateTransactionAmount(gb.lastBuyPrice);

        Logger.log(1, "\n+++++ Last BUY Order has been removed +++++");
    }

    improveSellAverage() {
        return (gb.asksAverage + gb.currentMarketPrice) / 2;
    }

    improveBuyAverage() {
        return (gb.bidsAverage + gb.currentMarketPrice) / 2;
    }

    placeImprovedSellOrder() {
        this.placeSellOrder(this.improveSellAverage());
    }

    placeImprovedBuyOrder() {
        this.placeBuyOrder(this.improveBuyAverage());
    }

    calculateTransactionAmount(price) {
        return price * conf.orderSize;
    }

    precisionRound(number, precision) {
        let factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }

    placeOrderOnExchange(price, side) {
        Logger.log(1, "\nPlacing " + side + " Order of " + price + " on "+ conf.exchange +" Exchange at: " + new Date());
        const params = {
            side: side,
            price: price,
            size: conf.orderSize,
            product_id: conf.productType,
            post_only: true
        };

        return Exchange.placeOrder(params);
    }

    cancelLastOrder() {
        Logger.log(1, "\nTrying to cancel last order...");
        return Exchange.cancelOrder(gb.lastOrderId);
    }


}

module.exports = new Trader();