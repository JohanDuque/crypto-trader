const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');

module.exports = class Strategy_V2 {
    static apply() {
        let betterAverage = gb.currentMarketPrice;

        if (gb.currentSellers > gb.lastBuyers && gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.bidsAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl > 2) Logger.log("Improved Average: " + betterAverage);

            trader.doBuy(betterAverage);
            gb.lastOrderWasFilled = false;
        }
        if (gb.lastBuyers > gb.currentSellers && gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl > 2) Logger.log("Improved Average: " + betterAverage);

            trader.doSell(betterAverage);
            gb.lastOrderWasFilled = false;
        }

        if (gb.iteration == 1) {
            gb.lastSellPrice = gb.currentMarketPrice; //This is only to give a starting point
        }
    };
}