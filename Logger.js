const Conf = require('./Configuration');
const gb = require('./GlobalVariables');
const fs = require('fs');
const moment = require('moment');

const reportFileName = './reports/' + Conf.traderId + "@" + moment().format('YYYYMMDD-hh-mm-ss') + '.log';
const useTimeInLog = false;

module.exports = class Logger {
    static log(lvl, msg) {

        if (Conf.logLvl >= lvl) console.log(msg);

        if (Conf.logOnFile && Conf.logLvl >= lvl) {
            let logMsg = '\n';

            if (useTimeInLog) {
                let logTime = moment().format('YYYY-MM-DD hh:mm:ss');
                logMsg += logTime + "  " + msg;
            }else{
                logMsg+=msg;
            }

            fs.appendFile(reportFileName, logMsg, (err) => {
                // throws an error, you could also catch it here
                if (err) throw err;
                // success case, the file was saved
                //console.log('File saved!');
            });
        }
    }

    static printReport() {
        this.log(0, "-------------------------------------------------------------");
        this.log(0, "  " + new Date() + "   " + "Iteration #" + gb.iteration);
        this.log(0, "  Trader# " + Conf.traderId + "        Errors: " + gb.errorCount);
        this.log(0, "\n  Last Buy Order : " + gb.lastBuyPrice + "(" + Conf.toCurrency + ")        Buy Orders: " + gb.buyOrders);
        this.log(0, "  Last Sell Order: " + gb.lastSellPrice + "(" + Conf.toCurrency + ")       Sell Orders: " + gb.sellOrders);
        this.log(0, "  Profits        : " + gb.profits + "(" + Conf.toCurrency + ")   Filled Orders: " + gb.fills);
        this.log(0, "  Current price  : " + gb.currentMarketPrice + "(" + Conf.toCurrency + ")");
        this.log(0, "-------------------------------------------------------------");
    }
}