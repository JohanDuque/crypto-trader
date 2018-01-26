const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');

module.exports = class Strategy_V4 {
    static apply() {
        let betterAverage;

        findStartingPoint();

        if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.bidsAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl >= 2) Logger.log("Improved Average: " + betterAverage);

            trader.doBuy(betterAverage);
        }

        if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice && gb.lastOrderWasFilled) {
            betterAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
            if (conf.logLvl >= 2) Logger.log("Improved Average: " + betterAverage);

            trader.doSell(betterAverage);
        }
    }
};

const findStartingPoint = () => {
    console.log("starting point");
    if (gb.sellOrders === gb.buyOrders === gb.fills === 0 && gb.currentSellers < gb.currentBuyers) {
        gb.lastSellPrice = gb.currentMarketPrice; //This is only to give a starting point
    }
};

const findStartingPoint2 = () => {
    if (gb.sellOrders === gb.buyOrders === gb.fills === 0) {
        gb.lastSellPrice = gb.currentMarketPrice; //This is only to give a starting point
    }
};