const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');

let isStarting = gb.sellOrders === gb.buyOrders &&
    gb.buyOrders === gb.fills &&
    gb.fills === gb.lastSellPrice &&
    gb.lastSellPrice === gb.lastBuyPrice &&
    gb.lastBuyPrice === 0;

module.exports = class Strategy_V5 {
    static apply() {
        let areBuyersTwiceSellers = gb.currentBuyers / gb.currentSellers > 2;
        let areSellersTwiceBuyers = gb.currentSellers / gb.currentBuyers > 2;

        let improveSellAverage = () => { return (gb.asksAverage + gb.currentMarketPrice) / 2; };
        let improveBuyAverage = () => { return (gb.bidsAverage + gb.currentMarketPrice) / 2; };

        let placeImprovedSellOrder = () => { return placeSellOrder(improveSellAverage()); };
        let placeImprovedBuyOrder = () => { return placeBuyOrder(improveBuyAverage()); };


        if (gb.lastOrderWasFilled) {
            //While market is constantly going UP...
            if (areBuyersTwiceSellers) {
                if (gb.lastAction !== conf.BUY) {
                    Logger.log(1, "  >> Market is constantly going UP, I'm buying!");
                    trader.placeBuyOrder(gb.currentMarketPrice);
                    return;
                } else {
                    if (gb.currentMarketPrice > gb.lastSellPrice) {
                        Logger.log(1, "  >> Market is constantly going UP, I'm SELLING at Improved average: " + improveSellAverage());
                        placeImprovedSellOrder();
                    }
                    return;
                }
            }

            //While market is constantly going DOWN...
            if (areSellersTwiceBuyers) {
                if (gb.lastAction !== conf.SELL) {
                    Logger.log(1, "  >> Market is going DOWN fast, I will wait to SELL");
                    return;
                }
            }

            if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice) {
                Logger.log(1, "Improved Average to Buy: " + improveBuyAverage());
                placeImprovedBuyOrder();
                return;
            }

            if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice) {
                Logger.log(1, "Improved Average to Sell: " + improveSellAverage());
                placeImprovedSellOrder();
                return;
            }
        } else { //I place an Order that has not been filled yet.

            if (areBuyersTwiceSellers) {
                if (gb.lastAction === conf.BUY) {
                    if (improveBuyAverage() > gv.lastBuyPrice) {
                        Logger.log(1, "  >> Market keeps constantly going UP");
                        Logger.log(1, "I'm replacing last BUY order Higher at Improved Average: " + improveBuyAverage());
                        trader.removeLastBuyOrder();
                        placeImprovedBuyOrder();
                        return;
                    }
                } else { //lastAction === conf.SELL
                    if (improveSellAverage() > gb.lastSellPrice) {
                        Logger.log(1, "  >> Market keeps constantly going UP");
                        Logger.log(1, "I'm replacing last SELL order Higher at Improved Average: " + improveSellAverage());
                        trader.removeLastSellOrder();
                        placeImprovedSellOrder();
                        return;
                    }
                }
            }

            //While market is constantly going DOWN...
            if (areSellersTwiceBuyers) {
                if (gb.lastAction === conf.BUY) {
                    Logger.log(1, "  >> Market keeps constantly going DOWN");
                    Logger.log(1, "I'm replacing last BUY order Lower!");
                    trader.removeLastBuyOrder();
                    trader.placeBuyOrder(gb.currentMarketPrice);
                    return;
                }
                Logger.log(1, "  >> Market keeps constantly going DOWN fast, I will wait to SELL");
            }
        }
    }
};