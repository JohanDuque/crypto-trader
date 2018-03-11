const conf = require('./commons/Configuration');
const gb = require('./commons/GlobalVariables');
const Logger = require('./commons/Logger');
const Simulator = require('./actors/Simulator');
const Exchange = require('./actors/Exchange');

const StrategyFactory = require('./commons/StrategyFactory');
const strategy = StrategyFactory.getStrategy();

let nIntervId;

let askForInfo = () => {
    return Promise.all([
        //Exchange.getCoinbaseAccounts(),
        Exchange.getAccounts(),
        //Exchange.getAccount(),
        //Exchange.getAccountHistory(),
        //Exchange.placeBuyOrder(),
        Exchange.getFills(),
        Exchange.getOrderBook(),
        Exchange.getTradeHistory()
    ])
};

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
        strategy.apply();

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

//****************** EXIT MESSAGE ***************//
process.on('exit', function(code) {
    Logger.printReport();
    return console.log(`About to exit with code ${code}`);
});

//******************* MAIN ********************//
if (conf.simulateFromRecording) {
    Simulator.simulateFromRecording();
} else {
    Logger.log(1, "Start Time: " + conf.startTime);
    Logger.log(1, "Trading will start within " + conf.maxPollingInterval + " seconds...");
    Logger.log(1, "Let's make Money! \n");
    nIntervId = setInterval(doTrade, conf.maxPollingInterval * 1000);
}

