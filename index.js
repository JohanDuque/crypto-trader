const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');
const Gdax = require('gdax');

const StrategyFactory = require('./StrategyFactory');
const strategy = StrategyFactory.getStrategy();

const publicClient = new Gdax.PublicClient();

let getAverage = (items) => {
    var sumItems = items.reduce((accumulator, item) => {
        //"item": [ price, size, num-orders ] 
        return accumulator + parseInt(item[0]);
    }, 0);
    return sumItems / items.length;
};

let calculateTransactionAmount = (price) => {
    return price * conf.orderSize;
};

let getOrderBook = () => {
    publicClient.getProductOrderBook(conf.productType, { level: 2 })
        .then(data => {
            if (conf.logLvl > 3) {
                Logger.log("Order Book:");
                Logger.log(data);
                Logger.log("\n");
            }

            gb.bidsAverage = getAverage(data.bids);
            gb.asksAverage = getAverage(data.asks);

            if (conf.logLvl > 2) {
                Logger.log("Bids Average: " + gb.bidsAverage + '');
                Logger.log("Asks Average: " + gb.asksAverage + '');
            }
        })
        .catch(error => {
            //TODO handle error
            gb.errorCount++;
            if (conf.logLvl > 4) Logger.log(error);
        });
};


let getProductTicker = () => {
    publicClient.getProductTicker(conf.productType)
        .then(data => {
            if (conf.logLvl > 3) {
                Logger.log("Product Ticker:");
                Logger.log(data);
            }
            gb.currentMarketPrice = Number(data.price);
        })
        .catch(error => {
            //TODO handle error
            gb.errorCount++;
            if (conf.logLvl > 4) Logger.log(error);
        });
};

let getTradeHistory = () => {
    publicClient.getProductTrades(conf.productType, { limit: conf.tradeSampleSize })
        .then(data => {
            if (conf.logLvl > 3) {
                Logger.log("Trade History:");
                Logger.log(data);
                Logger.log("\n");
            }

            checkFills(data);
            gb.lastSellers = data.filter(data => data.side === conf.BUY).length;
            gb.lastBuyers = data.filter(data => data.side === conf.SELL).length;

            if (conf.logLvl > 2) {
                Logger.log('Current Buyers: ' + gb.lastBuyers);
                Logger.log('Current Sellers: ' + gb.lastSellers);
            }
        })
        .catch(error => {
            //TODO handle error
            gb.errorCount++;
            if (conf.logLvl > 4) Logger.log(error);
        });
};

let checkFills = (tradeHistory) => {
    let filteredArray;
    if (!gb.lastOrderWasFilled) {
        if (gb.lastAction === buy) {
            filteredArray = tradeHistory.filter((data) => { return Math.abs(gb.lastBuyPrice - data.price) <= conf.orderFillError });
        } else {
            filteredArray = tradeHistory.filter((data) => { return Math.abs(gb.lastSellPrice - data.price) <= conf.orderFillError });
        }

        gb.lastOrderWasFilled = filteredArray.length > 0;

        if (gb.lastOrderWasFilled) {
            gb.fills++;
            Logger.printReport();
        };
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

    applyStrategy();
    askForInfo();

    if (conf.logLvl > 1) Logger.printReport();

    if (gb.profits <= 0) {
        Logger.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
        clearInterval(gb.nIntervId);
    }

    if (gb.errorCount > conf.errorTolerance) {
        Logger.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
        clearInterval(gb.nIntervId);
    }
};

askForInfo();
gb.nIntervId = setInterval(doTrade, conf.pollingInterval * 1000);