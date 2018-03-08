const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const Logger = require('../commons/Logger');
const conf = require('../commons/Configuration');
const analyzer = require('../actors/Analyzer');

class Strategy_V12 {

    apply() {
        if (gb.lastOrderWasFilled || gb.buyOrders == 0) {
            //if ((gb.fills + 1) >= (gb.buyOrders + gb.sellOrders)) {
            if (gb.lastAction !== conf.BUY) {
                //if (gb.buyOrders - gb.sellOrders < (1)) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "\nMarket is GoingFrom DOWN to UP I'm buying CLOSE to current price");
                    trader.placeBuyOrderCloseToCurrentMarketPrice();
                    return;
                }
            } else { //I'm trying to SELL
                //}
                //if (gb.sellOrders - gb.buyOrders < (1)) {
                if (analyzer.isMarketGoingFromUpToDown() && (gb.currentMarketPrice - gb.lastBuyPrice > 1)) {
                    Logger.log(1, "\nMarket is GoingFrom UP to DOWN I'm selling now at current price");
                    trader.placeSellOrderCloseToCurrentMarketPrice();
                    return;
                }
            }
        }

        if (gb.lastAction === conf.SELL && (!gb.lastOrderWasFilled && gb.buyOrders>0)) {
            if (analyzer.isBuySpeedIncreasing()) {
                Logger.log(1, "\n\t\t\t\tMarket is Higher than Sell order place I'm removing it");
                trader.removeLastSellOrder();
                trader.placeImprovedSellOrder();
                return;
            }
        }

        //Cutting loses
        if (gb.lastAction === conf.BUY) {
            if (analyzer.isSellSpeedIncreasing() && (gb.currentMarketPrice < gb.lastBuyPrice)) {
                if (!gb.lastOrderWasFilled && gb.buyOrders > 0) {
                    Logger.log(1, "\n\t\t\t\tMarket lower than last buy I'm improving my order ");
                    trader.removeLastBuyOrder();
                    trader.placeBuyOrderCloseToCurrentMarketPrice();
                    return;
                }
                else{
                    Logger.log(1, "\n\t\t\t\tMarket lower than last buy I'm selling now ");
                    trader.placeSellOrderAtCurrentMarketPrice();
                    return;
                }
            }
        }

    }
};

module.exports = new Strategy_V12();