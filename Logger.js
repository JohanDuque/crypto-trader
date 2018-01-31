const Conf = require('./Configuration');
const gb = require('./GlobalVariables');

let logger = require('tracer').dailyfile({ root: './logs', maxLogFiles: 10, allLogsFileName: Conf.traderId + "@" });


module.exports = class Logger {
    static log(lvl, msg) {

        if (Conf.logLvl >= lvl) console.log(msg);

        if (Conf.logOnFile) {
            logger.info(msg);
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