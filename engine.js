const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');
const Gdax = require('gdax');

const StrategyFactory = require('./StrategyFactory');
const strategy = StrategyFactory.getStrategy();

const publicClient = new Gdax.PublicClient();


let getOrderBook = () => {
    publicClient.getProductOrderBook(conf.productType, { level: 2 })
        .then(data => {
            if (conf.logLvl >= 3) {
                Logger.log("Order Book:");
                Logger.log(data);
                Logger.log("\n");
            }

            gb.bidsAverage = getAverage(data.bids);
            gb.asksAverage = getAverage(data.asks);

            if (conf.logLvl >= 2) {
                Logger.log("Bids Average: " + gb.bidsAverage + '');
                Logger.log("Asks Average: " + gb.asksAverage + '');
            }
        })
        .catch(error => {
            //TODO handle error
            gb.errorCount++;
            if (conf.logLvl >= 4) Logger.log(error);
        });
};


let getProductTicker = () => {
    publicClient.getProductTicker(conf.productType)
        .then(data => {
            if (conf.logLvl >= 3) {
                Logger.log("Product Ticker:");
                Logger.log(data);
            }
            gb.currentMarketPrice = Number(data.price);
        })
        .catch(error => {
            //TODO handle error
            gb.errorCount++;
            if (conf.logLvl >= 4) Logger.log(error);
        });
};

let getTradeHistory = () => {
    publicClient.getProductTrades(conf.productType, { limit: conf.tradeHistorySize })
        .then(data => {
            if (conf.logLvl >= 3) {
                Logger.log("Trade History:");
                Logger.log(data);
                Logger.log("\n");
            }
            gb.tradeHistory = data;
            gb.currentSellers = data.filter(data => data.side === conf.BUY).length;
            gb.currentBuyers = data.filter(data => data.side === conf.SELL).length;

            if (conf.logLvl >= 2) {
                Logger.log('Current Buyers: ' + gb.currentBuyers);
                Logger.log('Current Sellers: ' + gb.currentSellers);
                Logger.log('   !! Current Market Price from Histoy: ' + data[0].price);
            }
        })
        .catch(error => {
            //TODO handle error
            gb.errorCount++;
            if (conf.logLvl >= 4) Logger.log(error);
        });
};

let getAverage = (items) => {
    let sumItems = items.reduce((accumulator, item) => {
        //"item": [ price, size, num-orders ] 
        return accumulator + parseInt(item[0]);
    }, 0);
    return sumItems / items.length;
};

let getMeanTradeFrequency = () => {
    let deltas = gb.tradeHistory.map((trade, index, tradeHistory) => {
        if (tradeHistory[index + 1]) {
            const date1 = new Date(trade.time).getTime();
            const date2 = new Date(tradeHistory[index + 1].time).getTime();

            return (date1 - date2) / 1000;
        } else {
            return 0;
        }
    });
    deltas.splice(-1, 1); //I remove last delta since is 0
    let meanTradeFrequency = deltas.reduce((accumulator, item) => {
        return accumulator + item;
    }, 0) / deltas.length;

    return meanTradeFrequency;
};


let checkFills = () => {
    let wasItFilled = undefined;

    if (!gb.lastOrderWasFilled) {
        if (gb.lastAction === conf.BUY) {
            wasItFilled = gb.tradeHistory.find((data) => {
                return (gb.lastBuyPrice - data.price) >= 0 || Math.abs(gb.lastBuyPrice - data.price) <= conf.orderFillError
            });

        } else { //gb.lastAction === sell
            wasItFilled = gb.tradeHistory.find((data) => {
                return (gb.lastSellPrice - data.price) <= 0 || Math.abs(gb.lastSellPrice - data.price) <= conf.orderFillError
            });
        }

        gb.lastOrderWasFilled = wasItFilled !== undefined;

        if (gb.lastOrderWasFilled) {
            gb.fills++;
            Logger.printReport();
        };

        if (conf.logLvl >= 3) {
            Logger.log("Possible Fills from History:");
            Logger.log(filteredArray);
            Logger.log("\n");
        }
    }
};

let askForInfo = () => {
    getOrderBook();
    getProductTicker();
    getTradeHistory();
};

let applyStrategy = () => { strategy.apply() };

//******************* MAIN ********************//
let doTrade = () => {
    gb.iteration++;

    askForInfo();
    checkFills();
    applyStrategy();

    if (getMeanTradeFrequency() > 3) {
        setPollingInterval(getMeanTradeFrequency());
    }

    if (conf.logLvl >= 1) Logger.printReport();

    if (gb.profits <= 0) {
        Logger.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
        clearInterval(gb.nIntervId);
    }

    if (gb.errorCount > conf.errorTolerance || gb.errorCount > gb.iteration) {
        Logger.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
        clearInterval(gb.nIntervId);
    }
};

let setPollingInterval = (interval) => {
    if (conf.logLvl >= 2) Logger.log("Setting Polling Iterval to " + interval + " seconds.");

    clearInterval(gb.nIntervId);
    gb.nIntervId = setInterval(doTrade, interval * 1000);
}

askForInfo();

Logger.log("Start Time: " + conf.startTime);
Logger.log("Trading will start in " + conf.startDelay * conf.pollingInterval + " seconds...");
setTimeout(() => {
    Logger.log("Let's make Money!");
    gb.nIntervId = setInterval(doTrade, conf.pollingInterval * 1000);
}, conf.startDelay * 1000);