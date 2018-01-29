const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');
const analysis = require('../Analysis');

module.exports = class Strategy_V6 {
    static apply() {
        if (gb.lastOrderWasFilled) {
            //While market is constantly going UP...

            //console.log("Is Ratio Increasing: " + analysis.isRatioIncreasing() );
            if (analysis.areBuyersTwiceSellers()) {
                if (gb.lastAction !== conf.BUY) {
                    Logger.log(1, "  >> Market is constantly going UP, I'm buying!");
                    trader.placeBuyOrderAtCurrentMarketPrice();
                    return;
                } else {
                    if (gb.currentMarketPrice > gb.lastSellPrice && analysis.isRatioIncreasing()) {
                        Logger.log(1, "  >> Market is constantly going UP, I'm SELLING at Improved average: " + trader.improveSellAverage());
                        trader.placeImprovedSellOrder();
                    }
                    return;
                }
            }

            //While market is constantly going DOWN...
            if (analysis.areSellersTwiceBuyers()) {
                if (gb.lastAction !== conf.SELL) { //So I bought
                    if (gb.lastBuyPrice > gb.currentMarketPrice) {
                        if (!analysis.isRatioIncreasing()) {
                            Logger.log(1, "  >> Market is going DOWN fast ratio is decerasing, I will place SELL order now");
                            trader.placeSellOrderAtCurrentMarketPrice();
                        } else {
                            Logger.log(1, "  > Market is going DOWN but ratio is  NOT, I will wait to SELL");
                        }
                        return;
                    } else {
                        Logger.log(1, "       .... Am I missing Money ??? ");
                    }
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

            if (analysis.areBuyersTwiceSellers() && analysis.isRatioIncreasing()) {
                Logger.log(1, "  >> Market keeps constantly going UP, ratio is increasing...");
                if (gb.lastAction === conf.BUY) {
                    if (trader.improveBuyAverage() > gb.lastBuyPrice) {
                        Logger.log(1, "I'm replacing last BUY order Higher at Improved Average: " + trader.improveBuyAverage());
                        trader.removeLastBuyOrder();
                        trader.placeImprovedBuyOrder();
                        return;
                    }
                } else { //lastAction === conf.SELL
                    if (trader.improveSellAverage() > gb.lastSellPrice) {
                        Logger.log(1, "I'm replacing last SELL order Higher at Improved Average: " + trader.improveSellAverage());
                        trader.removeLastSellOrder();
                        trader.placeImprovedSellOrder();
                        return;
                    }
                }
            }

            //While market is constantly going DOWN...
            if (analysis.areSellersTwiceBuyers() && !analysis.isRatioIncreasing()) {
                if (gb.lastAction === conf.BUY) {
                    Logger.log(1, "  >> Market keeps constantly going DOWN");
                    Logger.log(1, "I'm replacing last BUY order Lower!");
                    trader.removeLastBuyOrder();
                    trader.placeImprovedBuyOrder();
                } else { // I'm trying to SELL
                    if (gb.lastBuyPrice > gb.currentMarketPrice) {
                        Logger.log(1, "  >> Market keeps constantly going DOWN fast, I'm going to SELL now!");
                        trader.removeLastSellOrder();
                        trader.placeSellOrderAtCurrentMarketPrice();
                        return;
                    }
                    Logger.log(1, "   ....  At this point I'm probably loosing money ");
                }
            }

            //While market is constantly going DOWN...
            if (gb.currenSellers > gb.currentBuyers && !analysis.isRatioIncreasing()) {
                if (gb.lastAction === conf.SELL) {
                    Logger.log(1, "  >> Market is going down apparenly slowly..");
                    if (gb.lastBuyPrice > gb.currentMarketPrice) {
                        Logger.log(1, "  >> I will SELL now!");
                        trader.removeLastSellOrder();
                        trader.placeSellOrderAtCurrentMarketPrice();
                        return;
                    }
                }
            }
        }
    }
};