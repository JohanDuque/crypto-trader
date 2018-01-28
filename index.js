const conf = require('./Configuration');
const gb = require('./GlobalVariables');
const Logger = require('./Logger');
const GdaxManager = require('./GdaxManager');

const StrategyFactory = require('./StrategyFactory');
const strategy = StrategyFactory.getStrategy();

let checkFills = () => {
    let wasItFilled = undefined;

    if (!gb.lastOrderWasFilled) {
        if (gb.lastAction === conf.BUY) {
            wasItFilled = gb.tradeHistory.find((trade) => {
                //return (gb.lastBuyPrice - trade.price) > 0 || Math.abs(gb.lastBuyPrice - trade.price) <= conf.orderFillError
                return (gb.lastBuyPrice - trade.price) > 0
            });

        } else { //gb.lastAction === sell
            wasItFilled = gb.tradeHistory.find((trade) => {
                //return (gb.lastSellPrice - trade.price) <= 0 || Math.abs(gb.lastSellPrice - data.price) <= conf.orderFillError
                return (gb.lastSellPrice - trade.price) < 0
            });
        }

        gb.lastOrderWasFilled = wasItFilled !== undefined;

        if (gb.lastOrderWasFilled) {
            gb.fills++;
            Logger.printReport();
        };
    }
};

let askForInfo = () => {
    return Promise.all([
        GdaxManager.getOrderBook(),
        GdaxManager.getTradeHistory()
    ])
};

let applyStrategy = () => { strategy.apply() };

let setPollingInterval = (interval) => {
    Logger.log(2, "Setting Polling Iterval to " + interval + " seconds.");

    clearInterval(gb.nIntervId);
    gb.nIntervId = setInterval(doTrade, interval * 1000);
};

let checkForErrors = () => {
    if (gb.profits <= 0) {
        Logger.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
        clearInterval(gb.nIntervId);
    }
    if (gb.errorCount > conf.errorTolerance || gb.errorCount > gb.iteration) {
        Logger.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
        clearInterval(gb.nIntervId);
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

//******************* MAIN ********************//
let doTrade = () => {
    gb.iteration++;

    Logger.log(2, "\nAsking for info at: " + new Date());

    askForInfo().then(() => {
        Logger.log(2, "Info received at:   " + new Date() + "\n");
        checkFills();
        applyStrategy();

        if (conf.logLvl >= 2) Logger.printReport();

        if (getMeanTradeFrequency() > conf.pollingInterval) {
            setPollingInterval(getMeanTradeFrequency());
        }

        checkForErrors();
    }, err => {
        //TODO handle error
        gb.errorCount++;
        Logger.log(4, err);
    });
};

Logger.log("Start Time: " + conf.startTime);
Logger.log("Trading will start within " + conf.pollingInterval + " seconds...");
Logger.log("Let's make Money! \n");
gb.nIntervId = setInterval(doTrade, conf.pollingInterval * 1000);