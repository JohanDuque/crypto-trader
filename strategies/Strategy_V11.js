const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');
const analyzer = require('../Analyzer');

class Strategy_V11 {

    apply() {
        if (gb.lastOrderWasFilled || gb.buyOrders == 0) {
            if (gb.lastAction !== conf.BUY) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "Market is GoingFrom DOWN to UP I'm buying CLOSE to current price");
                    trader.placeBuyOrderCloseToCurrentMarketPrice();
                    return;
                }

            } else { //I'm trying to SELL
                if (analyzer.isMarketGoingFromUpToDown() && (gb.currentMarketPrice - gb.lastBuyPrice  > 1)) {
                    Logger.log(1, "Market is GoingFrom UP to DOWN I'm selling now at current price");
                    trader.placeSellOrderAtCurrentMarketPrice();
                    return;
                }
            }
        }
    }
};

module.exports = new Strategy_V11();