const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const conf = require('../commons/Configuration');
const Logger = require('../commons/Logger');
const analyzer = require('../actors/Analyzer');

class Strategy_V10 {

    apply() {
        if (gb.lastOrderWasFilled || gb.buyOrders == 0) {
            if (gb.lastAction !== conf.BUY) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "Market is GoingFrom DOWN to UP I'm buying at current price");
                    trader.placeBuyOrderAtCurrentMarketPrice();
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

module.exports = new Strategy_V10();