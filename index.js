const conf = require('./commons/Configuration');
const gb = require('./commons/GlobalVariables');
const Logger = require('./commons/Logger');
const util = require('util');
const GdaxManager = require('./Gdax/GdaxManager');

const StrategyFactory = require('./commons/StrategyFactory');
const strategy = StrategyFactory.getStrategy();

let nIntervId;

let checkFills = () => {
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
            };
        }
    }
};

let askForInfo = () => {
    return Promise.all([
        //GdaxManager.getCoinbaseAccounts(),
        //GdaxManager.getAccounts(),
        //GdaxManager.getAccount(),
        //GdaxManager.getAccountHistory(),
        //GdaxManager.placeBuyOrder(),
        GdaxManager.getFills(),
        GdaxManager.getOrderBook(),
        GdaxManager.getTradeHistory()
    ])
};

let applyStrategy = () => { strategy.apply() };

let setPollingInterval = (interval) => {
    Logger.log(2, "Setting Polling Iterval to " + interval + " seconds.");

    clearInterval(nIntervId);
    nIntervId = setInterval(doTrade, interval * 1000);
};

let checkForErrors = () => {
    if (gb.profits <= 0) {
        Logger.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
        clearInterval(nIntervId);
    }
    if (gb.errorCount > conf.errorTolerance || gb.errorCount > gb.iteration) {
        Logger.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
        clearInterval(nIntervId);
    }
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

let doTrade = () => {
    gb.iteration++;
    Logger.log(2, "\nAsking for info at: " + new Date());

    askForInfo().then(() => {
        Logger.log(2, "Info received at:   " + new Date() + "\n");

        Logger.recordInfo();
        applyStrategy();

        if (conf.logLvl >= 2) Logger.printReport();

        const meanFrequency = getMeanTradeFrequency();
        if (meanFrequency > conf.minPollingInterval && meanFrequency < conf.maxPollingInterval) {
            setPollingInterval(meanFrequency);
        }

        checkForErrors();
    }, err => {
        //TODO handle error
        gb.errorCount++;
        Logger.log(4, err);
    });
};

let simulateFromRecording = () => {
    const infoRecorded = require(conf.recordingFile);

    infoRecorded.forEach(function(element) {
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
        gb.lowestTradePrice = element.lowestTradePrice;
        gb.hightestTradePrice = element.hightestTradePrice;
        gb.totalAmoutTraded = element.totalAmoutTraded;

        checkFills();
        applyStrategy();

        //Logger.log(1, 'It#' + gb.iteration + ' \nBuyers:' + gb.currentBuyers+ ' Sellers:' + gb.currentSellers+ ' MarketPrice:' +gb.currentMarketPrice + ' BUYspeed(Buy/Sell):' + gb.currentBuySpeed+ ' SELLspeed(Sell/Buy):' + gb.currentSellSpeed);

        if (conf.logLvl >= 2) Logger.printReport();
        checkForErrors();
    });
    Logger.log(1, "\n Simulation Done!");
}


//******************* MAIN ********************//
if (conf.simulateFromRecording) {
    simulateFromRecording();
} else {
    Logger.log(1, "Start Time: " + conf.startTime);
    Logger.log(1, "Trading will start within " + conf.maxPollingInterval + " seconds...");
    Logger.log(1, "Let's make Money! \n");
    nIntervId = setInterval(doTrade, conf.maxPollingInterval * 1000);
}