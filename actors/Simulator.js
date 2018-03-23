const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Logger = require('../commons/Logger');
const StrategyFactory = require('../commons/StrategyFactory');
const Exchange = require('../actors/Exchange');
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
                gb.tradeHistory = element.tradeHistory;
                gb.errorCount = element.errorCount;
                gb.iteration = element.iteration;
                Exchange.elaborateTradeHistory();

                //FIXME the following lines can be used only with recent files from 23 March
                if (gb.orderBook) {
                    gb.orderBook = element.orderBook;
                    Exchange.elaborateOrderBook();
                } else {
                    gb.bidsAverage = element.bidsAverage;
                    gb.asksAverage = element.asksAverage;
                }

                me.checkFills();
                strategy.apply();

                logString = '\tBuyers:' + gb.currentBuyers + '\t Sellers:' + gb.currentSellers + '\t MarketPrice:' + gb.currentMarketPrice + '\t BUYspeed:' + gb.currentBuySpeed + '\t SELLspeed:' + gb.currentSellSpeed;

                if (logString !== lastLogString) {
                    //Logger.log(1, 'It#' + gb.iteration + logString);
                }
                lastLogString = logString;

                if (conf.logLvl >= 2) Logger.printReport();
                me.checkForErrors();
                resolve();
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

    checkForErrors() {
        if (gb.profits <= 0) {
            Logger.log(0, "\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
            process.exit();
        }
        if (gb.errorCount > conf.errorTolerance || gb.errorCount > gb.iteration) {
            Logger.log(0, "\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
            process.exit();
        }
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
        gb.tradeHistory = null;
        gb.orderBook = null;
        gb.lastBuySpeed = 0; //buyers/sellers
        gb.currentBuySpeed = 0; //buyers/sellers
        gb.lastSellSpeed = 0; //sellers/buyers
        gb.currentSellSpeed = 0; //sellers/buyers
    }
}

module.exports = new Simulator();