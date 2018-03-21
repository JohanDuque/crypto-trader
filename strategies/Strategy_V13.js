const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const Logger = require('../commons/Logger');
const conf = require('../commons/Configuration');
const analyzer = require('../actors/Analyzer');

class Strategy_V13 {

    apply() {
        if (gb.lastOrderWasFilled || gb.buyOrders == 0) {
            if (gb.lastAction !== conf.BUY) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "\nMarket is going from DOWN to UP I'm buying CLOSE to current price");
                    trader.placeBuyOrderCloseToCurrentMarketPrice();
                    return;
                }
            } else { //I'm trying to SELL
                if (analyzer.isMarketGoingFromUpToDown() && (gb.currentMarketPrice - gb.lastBuyPrice > 1)) {
                    Logger.log(1, "\nMarket is going from UP to DOWN I'm selling now close to current price");
                    trader.placeSellOrderCloseToCurrentMarketPrice();
                    return;
                }
            }
        }

        if (gb.lastAction === conf.SELL && (!gb.lastOrderWasFilled && gb.buyOrders > 0)) {
            //if (analyzer.isSellSpeedIncreasing() && gb.currentMarketPrice > gb.lastSellPrice) {
            if (gb.currentMarketPrice > gb.lastSellPrice) {
                Logger.log(1, "\n\t\t\t\tMarket is Higher than last SELL order placed, I'm improving it!");
                trader.improveLastSellOrder();
                return;
            }
        }

        //Cutting losses
        if (gb.lastAction === conf.BUY) {
            //if (analyzer.isBuySpeedIncreasing() && (gb.currentMarketPrice < gb.lastBuyPrice)) {
            if (gb.currentMarketPrice < gb.lastBuyPrice - (gb.lastBuyPrice * 0.01)) {
                if (!gb.lastOrderWasFilled && gb.buyOrders > 0) {
                    Logger.log(1, "\n\t\t\tMarket is lower than last BUY order, I'm improving my order ");
                    trader.improveLastBuyOrder();
                    return;
                }
                else {
                    Logger.log(1, "\n\t\t\tMarket is lower than last BUY I'm selling now in order to CUT MY LOSSES");
                    trader.placeSellOrderAtCurrentMarketPrice();
                    return;
                }
            }
        }

    }
}

module.exports = new Strategy_V13();