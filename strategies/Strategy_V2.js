const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const conf = require('../commons/Configuration');
const Logger = require('../commons/Logger');

module.exports = class Strategy_V2 {
    static apply() {
        let betterAverage = gb.currentMarketPrice;

        if (gb.currentSellers > gb.currentBuyers && gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.bidsAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl > 2) Logger.log("Improved Average: " + betterAverage);

            trader.placeBuyOrder(betterAverage);
            gb.lastOrderWasFilled = false;
        }
        if (gb.currentBuyers > gb.currentSellers && gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl > 2) Logger.log("Improved Average: " + betterAverage);

            trader.placeSellOrder(betterAverage);
            gb.lastOrderWasFilled = false;
        }

        if (gb.iteration == 1) {
            gb.lastSellPrice = gb.currentMarketPrice; //This is only to give a starting point
        }
    };
}