const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const conf = require('../commons/Configuration');
const Logger = require('../commons/Logger');

module.exports = class Strategy_V1 {
    static apply() {
        if (gb.currentSellers > gb.currentBuyers && gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.bidsAverage && gb.lastOrderWasFilled) {
            trader.placeBuyOrder(gb.bidsAverage);
            gb.lastOrderWasFilled = false;
        }
        if (gb.currentBuyers > gb.currentSellers && gb.lastAction !== conf.SELL && gb.asksAverage > gb.lastBuyPrice && gb.lastOrderWasFilled) {
            trader.placeSellOrder(gb.asksAverage);
            gb.lastOrderWasFilled = false;
        }
        if (gb.iteration == 1) {
            trader.placeBuyOrder(gb.bidsAverage); //I'm assuming first action will be to Buy, could be buggy!
        }
    };
}