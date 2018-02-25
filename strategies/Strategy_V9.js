const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');
const analyzer = require('../Analyzer');

class Strategy_V9 {

    apply() {
        if (gb.lastOrderWasFilled) {
            if (gb.lastAction !== conf.BUY) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "Market is GoingFrom DOWN to UP I'm buying at current price");
                    trader.placeBuyOrderAtCurrentMarketPrice();
                    return;
                }

            } else { //I'm trying to SELL
                if (analyzer.isMarketGoingFromUpToDown() && gb.lastBuyPrice < gb.currentMarketPrice) {
                    Logger.log(1, "Market is GoingFrom UP to DOWN I'm selling now at current price");
                    trader.placeSellOrderAtCurrentMarketPrice();
                    return;
                }
            }
        }
    }
};

module.exports = new Strategy_V9();