const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Logger = require('../commons/Logger');
const StrategyFactory = require('../commons/StrategyFactory');
const Exchange = require('../actors/Exchange');
const strategy = StrategyFactory.getStrategy();
const util = require('util');

class Simulator {

    simulateFromRecordings() {
        const me = this;
        const iterations = conf.recordingFileNames.reduce((promiseChain, filename) => {
            return promiseChain.then(() => new Promise((resolve) => {
                me.simulateFromFile(require('../recordings/' + filename), filename, resolve);
            }));
        }, Promise.resolve());

        iterations.then(() => {
            console.log('Simulation Done!');
        });
    }

    simulateFromFile(infoRecorded, filename, resolveP) {
        let logString, lastLogString = "";
        const me = this;

        let lastTradeHistory;

        const iterations = infoRecorded.reduce((promiseChain, element) => {
            return promiseChain.then(() => new Promise((resolve) => {

                lastTradeHistory = gb.tradeHistory;

                gb.tradeHistory = element.tradeHistory;
                gb.errorCount = element.errorCount;
                gb.iteration = element.iteration;
                Exchange.elaborateTradeHistory();

                //FIXME the following lines can be used only with recent files from 23 March
                if (element.orderBook) {
                    gb.orderBook = element.orderBook;
                    Exchange.elaborateOrderBook();
                } else {
                    gb.bidsAverage = element.bidsAverage;
                    gb.asksAverage = element.asksAverage;
                }

                me.filterHistory(lastTradeHistory);
                me.checkFills();
                strategy.apply();

                logString = '\tSellers:' + gb.currentSellers + '\t Buyers:' + gb.currentBuyers + '\t MarketPrice:' + gb.currentMarketPrice + '\t BUYspeed:' + gb.currentBuySpeed + '\t SELLspeed:' + gb.currentSellSpeed;
                if (logString !== lastLogString) {
                    Logger.log(1, 'It#' + gb.iteration + logString);
                   // Logger.log(1, '\nHistory: ' + util.inspect(gb.tradeHistory.slice(0,conf.tradeHistorySize), {depth: 2}));
                    //Logger.log(1, '\nBook: ' +util.inspect(gb.orderBook, {depth: 2}));
                }
                lastLogString = logString;

                if (conf.logLvl >= 2) Logger.printReport();
                me.checkForErrors();

                lastTradeHistory = element.tradeHistory;
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

    filterHistory(lastTradeHistory) {
        if (lastTradeHistory) {
            const result = gb.tradeHistory.filter(ele => !lastTradeHistory.find(a => ele.time === a.time));
            gb.tradeHistory = result;
        }
    }

    checkFills() {
        if (gb.buyOrders > 0 && !gb.lastOrderWasFilled) {
            const wasItFilled = gb.tradeHistory.find((trade) => {//FIXME watch out with the time of the orders
                if(gb.lastAction === conf.BUY){
                    return gb.lastBuyPrice == trade.price && conf.orderSize <= trade.size && gb.lastAction === trade.side;
                }

                if(gb.lastAction === conf.SELL){
                    return gb.lastBuyPrice <= trade.price && conf.orderSize <= trade.size && gb.lastAction === trade.side;
                }
            });

            if (wasItFilled) {
                gb.lastOrderWasFilled = true;
                gb.fills++;
                Logger.printReport();
            }
        }
    }

    checkForErrors() {
        if (gb.profits <= 0) {
            Logger.log(-1, "\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
            process.exit();
        }
        if (gb.errorCount > conf.errorTolerance || gb.errorCount > gb.iteration) {
            Logger.log(-1, "\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
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
        gb.currentSellers = 0;
        gb.currentBuyers = 0;
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