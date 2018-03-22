const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Logger = require('../commons/Logger');
const StrategyFactory = require('../commons/StrategyFactory');
const strategy = StrategyFactory.getStrategy();

class Simulator {

    simulateFromRecordings() {
        const me = this;
        const iterations = conf.recordingFileNames.reduce((promiseChain, filename) => {
            return promiseChain.then(() => new Promise((resolve) => {
                me.simulateFromFile(require('../recordings/' + filename), filename, resolve);
                //resolve();
            }));
        }, Promise.resolve());

        iterations.then(() => {
            console.log('Simulation Done!');
        });
    }

    simulateFromFile(infoRecorded, filename, resolveP) {
        let logString, lastLogString = "";
        const me = this;

        const iterations = infoRecorded.reduce((promiseChain, element) => {
            return promiseChain.then(() => new Promise((resolve) => {
                //TODO use a map
                //gb.profits = element.profits;
                gb.iteration = element.iteration;
                gb.bidsAverage = element.bidsAverage;
                //gb.lastBuyPrice = element.lastBuyPrice;
                gb.asksAverage = element.asksAverage;
                //gb.lastSellPrice = element.lastSellPrice;
                gb.currentMarketPrice = element.currentMarketPrice;
                gb.currentBuyers = element.currentBuyers;
                gb.currentSellers = element.currentSellers;
                //gb.lastAction = element.lastAction;
                //gb.buyOrders = element.buyOrders;
                //gb.sellOrders = element.sellOrders;
                gb.errorCount = element.errorCount;
                //gb.lastOrderWasFilled = element.lastOrderWasFilled;
                //gb.fills = element.fills;
                gb.tradeHistory = element.tradeHistory;
                gb.lastBuySpeed = element.lastBuySpeed; //buyers/sellers
                gb.currentBuySpeed = element.currentBuySpeed; //buyers/sellers
                gb.lastSellSpeed = element.lastSellSpeed; //sellers/buyers
                gb.currentSellSpeed = element.currentSellSpeed; //sellers/buyers

                me.checkFills();
                strategy.apply();

                logString = '\tBuyers:' + gb.currentBuyers + '\t Sellers:' + gb.currentSellers + '\t MarketPrice:' + gb.currentMarketPrice + '\t BUYspeed:' + gb.currentBuySpeed + '\t SELLspeed:' + gb.currentSellSpeed;

                if (logString !== lastLogString) {
                    //Logger.log(1, 'It#' + gb.iteration + logString);
                }
                lastLogString = logString;

                if (conf.logLvl >= 2) Logger.printReport();
                me.checkForErrors(resolve);
                //resolve();
            }));
        }, Promise.resolve());

        iterations.then(() => {
            console.log('\n Simulation of recording: ' + filename);
            Logger.printLastReport();
            me.clearGlobals();
            resolveP();
        });
    }

    checkFills() {
        if (gb.buyOrders > 0) {
            let wasItFilled = undefined;

            if (!gb.lastOrderWasFilled) {
                if (gb.lastAction === conf.BUY) {
                    wasItFilled = gb.tradeHistory.find((trade) => {
                        //return (gb.lastBuyPrice - trade.price) > 0 || Math.abs(gb.lastBuyPrice - trade.price) <= conf.orderFillError
                        return (gb.lastBuyPrice - trade.price) >= 0;
                    });
                } else { //gb.lastAction === sell
                    wasItFilled = gb.tradeHistory.find((trade) => {
                        //return (gb.lastSellPrice - trade.price) <= 0 || Math.abs(gb.lastSellPrice - data.price) <= conf.orderFillError
                        return (gb.lastSellPrice - trade.price) <= 0;
                    });
                }

                gb.lastOrderWasFilled = wasItFilled !== undefined;

                if (gb.lastOrderWasFilled) {
                    gb.fills++;
                    Logger.printReport();
                }
            }
        }
    }

    checkForErrors(resolve) {
        if (gb.profits <= 0) {
            Logger.log(0, "\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
            process.exit();
        }
        if (gb.errorCount > conf.errorTolerance || gb.errorCount > gb.iteration) {
            Logger.log(0, "\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
            process.exit();
        }
        resolve();
    }

    clearGlobals() {
        gb.profits = conf.investment;
        gb.iteration = 0;
        gb.bidsAverage = 0;
        gb.lastBuyPrice = 0;
        gb.asksAverage = 0;
        gb.lastSellPrice = 0;
        gb.currentMarketPrice = 0;
        gb.currentBuyers = 0;
        gb.currentSellers = 0;
        gb.lastAction = null;
        gb.buyOrders = 0;
        gb.sellOrders = 0;
        gb.errorCount = 0;
        gb.lastOrderWasFilled = false;
        gb.lastOrderId = null;
        gb.fills = 0;
        gb.tradeHistory= null;
        gb.lastBuySpeed = 0; //buyers/sellers
        gb.currentBuySpeed = 0; //buyers/sellers
        gb.lastSellSpeed = 0; //sellers/buyers
        gb.currentSellSpeed = 0; //sellers/buyers
    }
}

module.exports = new Simulator();