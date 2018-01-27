const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');

let isStarting = gb.sellOrders === gb.buyOrders &&
    gb.buyOrders === gb.fills &&
    gb.fills === gb.lastSellPrice &&
    gb.lastSellPrice === gb.lastBuyPrice &&
    gb.lastBuyPrice === 0;

module.exports = class Strategy_V4 {
    static apply() {
        let betterAverage;

        if (isStarting) {
            findStartingPoint2();

        } else if (gb.lastOrderWasFilled) {
            if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice) {
                improvedAverage = (gb.bidsAverage + gb.currentMarketPrice) / 2;
                if (conf.logLvl >= 2) Logger.log("Improved Average: " + improvedAverage);

                trader.placeBuyOrder(improvedAverage);

            } else if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice) {
                improvedAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
                if (conf.logLvl >= 2) Logger.log("Improved Average: " + improvedAverage);
                trader.placeSellOrder(improvedAverage);
            }
        }
    }
};

const findStartingPoint = () => {
    if (isStarting && gb.currentSellers < gb.currentBuyers) {
        console.log("!!! Starting point @ " + gb.currentMarketPrice + " !!!!!!!");
        gb.lastSellPrice = gb.currentMarketPrice; //This is only to give a starting point
        isStarting = false;
    }
};

const findStartingPoint2 = () => {
    if (isStarting) {
        improvedAverage = (gb.asksAverage + gb.currentMarketPrice) / 2;
        if (conf.logLvl >= 2) Logger.log("Improved Average: " + improvedAverage);

        gb.lastSellPrice = improvedAverage; //This is only to give a starting point
        isStarting = false;
    }
};

