const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');
const analyzer = require('../Analyzer');

module.exports = class Strategy_V5 {
    static apply() {
        if (gb.lastOrderWasFilled) {
            //While market is constantly going UP...
            if (analyzer.areBuyersTwiceSellers()) {
                if (gb.lastAction !== conf.BUY) {
                    Logger.log(1, "  >> Market is constantly going UP, I'm buying!");
                    trader.placeBuyOrder(gb.currentMarketPrice);
                    return;
                } else {
                    if (gb.currentMarketPrice > gb.lastSellPrice) {
                        Logger.log(1, "  >> Market is constantly going UP, I'm SELLING at Improved average: " + trader.improveSellAverage());
                        trader.placeImprovedSellOrder();
                    }
                    return;
                }
            }

            //While market is constantly going DOWN...
            if (analyzer.areSellersTwiceBuyers()) {
                if (gb.lastAction !== conf.SELL) {
                    Logger.log(1, "  >> Market is going DOWN fast, I will wait to SELL");
                    return;
                }
            }

            if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice) {
                Logger.log(1, "Improved Average to Buy: " + trader.improveBuyAverage());
                trader.placeImprovedBuyOrder();
                return;
            }

            if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice) {
                Logger.log(1, "Improved Average to Sell: " + trader.improveSellAverage());
                trader.placeImprovedSellOrder();
                return;
            }
        } else { //I place an Order that has not been filled yet.

            if (analyzer.areBuyersTwiceSellers()) {
                if (gb.lastAction === conf.BUY) {
                    if (trader.improveBuyAverage() > gb.lastBuyPrice) {
                        Logger.log(1, "  >> Market keeps constantly going UP");
                        Logger.log(1, "I'm replacing last BUY order Higher at Improved Average: " + trader.improveBuyAverage());
                        trader.removeLastBuyOrder();
                        trader.placeImprovedBuyOrder();
                        return;
                    }
                } else { //lastAction === conf.SELL
                    if (trader.improveSellAverage() > gb.lastSellPrice) {
                        Logger.log(1, "  >> Market keeps constantly going UP");
                        Logger.log(1, "I'm replacing last SELL order Higher at Improved Average: " + trader.improveSellAverage());
                        trader.removeLastSellOrder();
                        trader.placeImprovedSellOrder();
                        return;
                    }
                }
            }

            //While market is constantly going DOWN...
            if (analyzer.areSellersTwiceBuyers()) {
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