const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');

let isStarting = gb.sellOrders === gb.buyOrders &&
    gb.buyOrders === gb.fills &&
    gb.fills === gb.lastSellPrice &&
    gb.lastSellPrice === gb.lastBuyPrice &&
    gb.lastBuyPrice === 0;

module.exports = class Strategy_V5 {
    static apply() {
        let improvedAverage;

        let isMarketGoingUPFast = gb.currentBuyers / gb.currentSellers > 2;
        let isMarketGoingDOWNfast = gb.currentSellers / gb.currentBuyers > 2;
        
        let improveAverage =(actionAverage) => { return (actionAverage + gb.currentMarketPrice) / 2;}; 

        if (gb.lastOrderWasFilled) {
            //While market is constantly going UP...
            if (isMarketGoingUPFast) {
                if (gb.lastAction !== conf.BUY) {
                    Logger.log(1, "  >> Market is constantly going UP, I'm buying!");
                    trader.placeBuyOrder(gb.currentMarketPrice);
                    return;
                } else {
                    improvedAverage = improveAverage(gb.asksAverage);
                    Logger.log(1, "  >> Market is constantly going UP, I'm SELLING at Improved average: " +improvedAverage);
                    trader.placeSellOrder(improvedAverage);
                    return;
                }

            }

            //While market is constantly going DOWN...
            if (isMarketGoingDOWNfast) {
                if (gb.lastAction !== conf.SELL) {
                    Logger.log(1, "  >> Market is going DOWN fast, I will wait to SELL");
                    return;
                }
            }

            if (gb.lastAction !== conf.BUY && gb.lastSellPrice >= gb.currentMarketPrice) {
                improvedAverage = improveAverage(gb.bidsAverage);
                Logger.log(1, "Improved Average to Buy: " + improvedAverage);

                trader.placeBuyOrder(improvedAverage);
                return;
            }

            if (gb.lastAction !== conf.SELL && gb.lastBuyPrice < gb.currentMarketPrice) {
                improvedAverage = improveAverage(gb.asksAverage);
                Logger.log(1, "Improved Average to Sell: " + improvedAverage);
                trader.placeSellOrder(improvedAverage);
                return;
            }
        } else { //I place an Order that has not been filled yet.

            if (isMarketGoingUPFast) {
                if (gb.lastAction === conf.BUY) {
                    improvedAverage = improveAverage(gb.bidsAverage);
                    if (improvedAverage > gv.lastBuyPrice) {
                        Logger.log(1, "  >> Market keeps constantly going UP");
                        Logger.log(1, "I'm replacing last BUY order Higher at Improved Average: " + improvedAverage);
                        trader.removeLastBuyOrder();
                        trader.placeBuyOrder(improvedAverage);
                        return;
                    }
                } else { //lastAction === conf.SELL
                    improvedAverage = improveAverage(gb.asksAverage);
                    if (improvedAverage > gb.lastSellPrice) {
                        Logger.log(1, "  >> Market keeps constantly going UP");
                        Logger.log(1, "I'm replacing last SELL order Higher at Improved Average: " + improvedAverage);
                        trader.removeLastSellOrder();
                        trader.placeSellOrder(improvedAverage);
                        return;
                    }
                }
            }

            //While market is constantly going DOWN...
            if (isMarketGoingDOWNfast) {
                if (gb.lastAction === conf.BUY) {
                    Logger.log(1, "  >> Market keeps constantly going DOWN");
                    Logger.log(1, "I'm replacing last BUY order Lower!");
                    trader.removeLastBuyOrder();
                    trader.placeBuyOrder(gb.currentMarketPrice);
                    return;
                } else { //lastAction === conf.SELL
                    Logger.log(1, "  >> Market keeps constantly going DOWN");
                    Logger.log(1, "I'm replacing last SELL order Lower!");
                    trader.removeLastSellOrder();
                    trader.placeSellOrder(gb.currentMarketPrice);
                    return;
                }
            }
        }
    }
};