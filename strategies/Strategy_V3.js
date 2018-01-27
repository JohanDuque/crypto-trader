const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');

module.exports = class Strategy_V3 {
    static apply() {
        let betterAverage;

        if (gb.currentSellers > gb.currentBuyers && gb.sellOrders === 0) {
            gb.lastSellPrice = gb.currentMarketPrice; //This is only to give a starting point
        }

        if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.bidsAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl >= 2) Logger.log("Improved Average: " + betterAverage);

            trader.placeBuyOrder(betterAverage);
        }

        if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl >= 2) Logger.log("Improved Average: " + betterAverage);

            trader.placeSellOrder(betterAverage);
        }
    };
}