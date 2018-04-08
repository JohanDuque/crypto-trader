const gb = require('../commons/GlobalVariables');
const trader = require('../actors/Trader');
const Logger = require('../commons/Logger');
const conf = require('../commons/Configuration');
const analyzer = require('../actors/Analyzer');

const R2 = 0.002;
const R1 = 0.001;

class Strategy_V15 {

    apply() {
        if (gb.lastOrderWasFilled || gb.buyOrders == 0) {
            if (gb.lastAction !== conf.BUY) {
                if (analyzer.isMarketGoingFromDownToUp()) {
                    Logger.log(1, "\nMarket is going from DOWN to UP I'm buying CLOSE to current price");
                    trader.placeBuyOrderCloseToCurrentMarketPrice();
                    return;
                }
            } else { //I'm trying to SELL
                if (analyzer.isLastBuyUpperByFactor(R2) && analyzer.isSellSpeedIncreasing()) {
                    Logger.log(1, "\nMarket is up by " + R2 + " and selling trend is increasing, I'm selling now close to current price");
                    trader.placeSellOrderCloseToCurrentMarketPrice();//TODO verify now I'm setting it up to current place
                    return;
                }
            }
        }

        if (gb.lastAction === conf.SELL && (!gb.lastOrderWasFilled && gb.buyOrders > 0)) {
            if (gb.currentMarketPrice > gb.lastSellPrice) {
                Logger.log(1, "\n\t\t\t\tMarket is Higher than last SELL order placed, I'm improving it!");
                trader.improveLastSellOrder();
                return;
            }
        }

        //Cutting losses
        if (gb.lastAction === conf.BUY && analyzer.isLastBuyLowerByFactor(R1)) {
            if (!gb.lastOrderWasFilled && gb.buyOrders > 0) {
                Logger.log(1, "\n\t\t\tMarket is lower than last BUY order by " + R1 + " I'm improving my order ");
                trader.improveLastBuyOrder();
                return;
            }
            else if (analyzer.isSellSpeedIncreasing()) {
                Logger.log(1, "\n\t\t\tMarket is lower than last BUY by " + R1 + " I'm selling now in order to CUT MY LOSSES");
                trader.placeSellOrderAtCurrentMarketPrice();
                return;
            }
        }

    }
}

module.exports = new Strategy_V15();