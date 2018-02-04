const gb = require('../GlobalVariables');
const trader = require('../Trader');
const conf = require('../Configuration');
const Logger = require('../Logger');
const analyzer = require('../Analyzer');

class Strategy_V7 {

    aboutToBuyWhileMarketGrowing() {
        if (gb.currentBuySpeed > 5) {
            Logger.log(1, "  >> Market going really UP, I'm buying!");
            trader.placeBuyOrderAtCurrentMarketPrice();
            return;
        }

        if (gb.currentBuySpeed > 3) {
            Logger.log(1, "  >> Market is constantly going UP, I will wait to BUY...");
            return;
        }

        if (gb.currentBuySpeed > 1) {
            Logger.log(1, "  >> Market is starting to go UP, I'm buying!");
            trader.placeBuyOrderAtCurrentMarketPrice();
            return;
        }
    }

    aboutToBuyWhileMarketDropping() {
        if (gb.currentSellSpeed > conf.tradeHistorySize - 5) {
            Logger.log(1, "  << Market is touching the floor, I'm buying at currentMarketPrice!");
            trader.placeBuyOrderAtCurrentMarketPrice();
            return;
        }


        if (gb.currentSellSpeed > 7) {
            Logger.log(1, "  << Market going really DOWN, I'm waiting to buy at improve Average!");
            return;
        }

        if (gb.currentSellSpeed > 3) {
            Logger.log(1, "  >> Market is constantly going DOWN, I will wait to BUY...");
            trader.placeImprovedBuyOrder();
            return;
        }
    }

    aboutToBuyWhileMarketStable() {
        if (gb.lastSellPrice > gb.currentMarketPrice) {
            Logger.log(1, "Market is stable, I still can buy at current price.'");
            trader.placeBuyOrderAtCurrentMarketPrice();
            return;
        }
        Logger.log(1, "Market is stable, I don't know what to do...");
    }


    aboutToSellWhileMarketGrowing() {
        if (gb.currentBuySpeed > 5) {
            Logger.log(1, "  >> Market going really UP, I'm selling at currentMarketPrice!");
            trader.placeSellOrderAtCurrentMarketPrice();
            return;
        }

        if (gb.currentBuySpeed > 3) {
            Logger.log(1, "  >> Market is constantly going UP, I'm selling at better price!");
            trader.placeImprovedSellOrder();
            return;
        }

        if (gb.currentBuySpeed > 1) {
            if (gb.lastBuyPrice > gb.currentMarketPrice) {
                Logger.log(1, "  >> Market is starting to go UP, I'm placing improve order!");
                return;
            }
        }
    }

    aboutToSellWhileMarketDropping() {
        if (gb.lastBuyPrice < gb.currentMarketPrice) {
            Logger.log(1, " << Market is going down, lower than last buy, I'm selling now");
            trader.placeSellOrderAtCurrentMarketPrice();
            return;
        }
    }

    aboutToSellWhileMarketStable() {
        if (gb.lastBuyPrice > gb.currentMarketPrice) {
            Logger.log(1, "Market is stable I'm selling at current price");
            trader.placeSellOrderAtCurrentMarketPrice();
            return;
        }
    }


    buyOrderPlacedWhileMarketGrowing() {
        if (gb.currentMarketPrice > gb.lastBuyPrice) {
            Logger.log(1, "  >> Market is constantly going UP, I have to replace last buy order...");
            trader.removeLastBuyOrder();
            trader.placeBuyOrderAtCurrentMarketPrice();
            return;
        }
    }

    buyOrderPlacedWhileMarketDropping() {
        if (gb.currentSellSpeed > 2) {
            Logger.log(1, "Market is dropping, I'm placing las buy order at better lower price");
            trader.removeLastBuyOrder();
            trader.placeImprovedBuyOrder();
            return;
        }
    }

    sellOrderPlacedWhileMarketGrowing() {
        if (gb.currentBuySpeed > 5) {
            Logger.log(1, "Market is really high, I'm leaving last sell order AS IS");
            return;
        }

        if (gb.currentBuySpeed > 2) {
            if (trader.improveSellAverage() > gb.lastSellPrice) {
                Logger.log(1, "  >> Market is constantly going UP, I'm replacing better sell order...");
                trader.removeLastSellOrder();
                trader.placeImprovedSellOrder()
                return;
            }
        }
    }

    sellOrderPlacedWhileMarketDropping() {
        if (gb.currentMarketPrice > gb.lastSellPrice) {
            if (gb.currentMarketPrice >= gb.lastBuyPrice) {
                Logger.log(1, "Market is going DOWN, I'm replacing last SELL order lower");
                trader.removeLastSellOrder();
                trader.placeSellOrderAtCurrentMarketPrice();
                return;
            }

        }
    }

    apply() {
        if (gb.lastOrderWasFilled) {
            if (gb.lastAction !== conf.BUY) {
                if (trader.isThisFirstTrade() || gb.lastSellPrice >= gb.currentMarketPrice) {
                    if (analyzer.isBuySpeedIncreasing()) {
                        //Logger.log("Market is going UP, I'm trying to BUY...");
                        Logger.log(1, "Market is going UP...");
                        this.aboutToBuyWhileMarketGrowing();
                        return;
                    }

                    if (analyzer.isSellSpeedIncreasing()) {
                        Logger.log(1, "Market is going DOWN, I'm trying to BUY...");
                        this.aboutToBuyWhileMarketDropping();
                        return;
                    }

                    this.aboutToBuyWhileMarketStable();
                }

            } else { //I'm trying to SELL
                if (gb.lastBuyPrice <= gb.currentMarketPrice) {
                    if (analyzer.isBuySpeedIncreasing()) {
                        Logger.log(1, "Market is going UP, I'm trying to SELL...");
                        this.aboutToSellWhileMarketGrowing();
                        return;
                    }

                    if (analyzer.isSellSpeedIncreasing()) {
                        Logger.log(1, "Market is going DOWN, I'm trying to SELL...");
                        this.aboutToSellWhileMarketDropping();
                        return;
                    }

                    this.aboutToSellWhileMarketStable();
                }
            }

        } else { //I placed an Order that has not been filled yet.

            if (gb.lastAction !== conf.SELL) {
                if (analyzer.isBuySpeedIncreasing()) {
                    Logger.log(1, "Market is going UP, I have placed buy Order...");
                    this.buyOrderPlacedWhileMarketGrowing();
                    return;
                }

                if (analyzer.isSellSpeedIncreasing()) {
                    Logger.log(1, "Market is going DOWN, I've placed buy order...");
                    this.buyOrderPlacedWhileMarketDropping();
                    return;
                }

            } else { //I'm trying to SELL

                if (analyzer.isBuySpeedIncreasing()) {
                    Logger.log(1, "Market is going UP, I've placed SELL...");
                    this.sellOrderPlacedWhileMarketGrowing();
                    return;
                }

                if (analyzer.isSellSpeedIncreasing()) {
                    Logger.log(1, "Market is going DOWN, I've placed SELL...");
                    this.sellOrderPlacedWhileMarketDropping();
                    return;
                }
            }
        }
    }
};

module.exports = new Strategy_V7();