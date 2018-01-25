const Conf = require('./Configuration');
const gb = require('./GlobalVariables');

module.exports = class Logger {
    static log(msg) {
        if (Conf.logLvl > 2) console.log("Start Time: " + Conf.startTime);
        console.log(msg);
    }

    static printReport() {
        if (Conf.logLvl > 0) {
            this.log("-------------------------------------------------------------");
            this.log("  "+new Date()+"   "+"Iteration #"+gb.iteration);
            this.log("  Trader# " + Conf.traderId + "         Errors: " + gb.errorCount);
            this.log("  Last Buy Order : " + gb.lastBuyPrice + "(" + Conf.toCurrency + ")        Buy Orders: " + gb.buyOrders);
            this.log("  Last Sell Order: " + gb.lastSellPrice + "(" + Conf.toCurrency + ")       Sell Orders: " + gb.sellOrders);
            this.log("  Profits        : " + gb.profits + "(" + Conf.toCurrency + ")   Filled Orders: " + gb.fills);
            this.log("  Current price  : " + gb.currentMarketPrice + "(" + Conf.toCurrency + ")");
            this.log("-------------------------------------------------------------");
        }
    }
}