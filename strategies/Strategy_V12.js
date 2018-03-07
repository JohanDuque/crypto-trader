const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const conf = require('../commons/Configuration');
const Logger = require('../commons/Logger');
const analyzer = require('../actors/Analyzer');

class Strategy_V12 {

    apply() {
        //if (gb.lastOrderWasFilled || gb.buyOrders == 0) {
            //if (gb.lastAction !== conf.BUY) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "\nMarket is GoingFrom DOWN to UP I'm buying CLOSE to current price");
                    trader.placeBuyOrderCloseToCurrentMarketPrice();
                    return;
                }

            //} else { //I'm trying to SELL
                if (analyzer.isMarketGoingFromUpToDown() && (gb.currentMarketPrice - gb.lastBuyPrice  > 1)) {
                    Logger.log(1, "\nMarket is GoingFrom UP to DOWN I'm selling now at current price");
                    trader.placeSellOrderAtCurrentMarketPrice();
                    return;
                }
            //}
        //}
    }
};

module.exports = new Strategy_V12();