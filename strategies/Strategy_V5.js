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
        let betterAverage;

        if (gb.lastOrderWasFilled) {
            //While market is constantly going UP...
            if (gb.currentBuyers > gb.currentSellers + conf.tradeHistorySize / 4) {
                if (gb.lastAction !== conf.BUY) {
                    trader.placeBuyOrder(gb.currentMarketPrice);
                    console.log("Market is constantly going UP, I'm buying!");
                }
                return;
            }

            //While market is constantly going DOWN...
            if (gb.currentSellers > gb.currentBuyers + conf.tradeHistorySize / 4) {
                if (gb.lastAction !== conf.BUY) {
                    console.log("Market is going DOWN fast, I will wait to SELL");
                    return;
                }
            }

            if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice) {
                improvedAverage = (gb.bidsAverage + gb.currentMarketPrice) / 2;
                if (conf.logLvl >= 2) Logger.log("Improved Average: " + improvedAverage);

                trader.placeBuyOrder(improvedAverage);
                return;
            }

            if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice) {
                improvedAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
                if (conf.logLvl >= 2) Logger.log("Improved Average: " + improvedAverage);
                trader.placeSellOrder(improvedAverage);
                return;
            }
        }
    }
};
