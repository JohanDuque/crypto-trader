const gb = require('../GlobalVariables');
const trader = require('../Trader');

module.exports = class Strategy_V1 {
    static apply() {
        if (gb.lastSellers > gb.lastBuyers && gb.lastAction !== gb.buyAction && gb.lastSellPrice >= gb.bidsAverage && gb.lastOrderWasFilled) {
            trader.doBuy(gb.bidsAverage);
            gb.lastOrderWasFilled = false;
        }
        if (gb.lastBuyers > gb.lastSellers && gb.lastAction !== gb.sellAction && gb.asksAverage > gb.lastBuyPrice && gb.lastOrderWasFilled) {
            trader.doSell(gb.asksAverage);
            gb.lastOrderWasFilled = false;
        }
        if (gb.iteration == 1) {
            trader.doBuy(gb.bidsAverage); //I'm assuming first action will be to Buy, could be buggy!
        }
    };
}