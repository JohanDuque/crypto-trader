const Conf = require('./Configuration');
const gb = require('./GlobalVariables');
var bunyan = require('bunyan');
/*var logger = bunyan.createLogger({name: 'myapp',
    streams: [{
        type: 'rotating-file',
        path: './log/crypto' + Conf.strategy +'.log',
        period: '6h',   // daily rotation
        count: 4        // keep 3 back copies
    }]});*/

var logger = require('tracer').dailyfile({root:'./logs', maxLogFiles: 10, allLogsFileName: 'crypto_v5.log'});
 

module.exports = class Logger {
    static log(msg) {
        console.log(msg);
        if(Conf.logOnFile){
            logger.info(msg);
        }
    }

    static printReport() {
        var logRows = [];
        logRows.push("-------------------------------------------------------------");
        logRows.push("  " + new Date() + "   " + "Iteration #" + gb.iteration);
        logRows.push("  Trader# " + Conf.traderId + "        Errors: " + gb.errorCount);
        logRows.push("\n  Last Buy Order : " + gb.lastBuyPrice + "(" + Conf.toCurrency + ")        Buy Orders: " + gb.buyOrders);
        logRows.push("  Last Sell Order: " + gb.lastSellPrice + "(" + Conf.toCurrency + ")       Sell Orders: " + gb.sellOrders);
        logRows.push("  Profits        : " + gb.profits + "(" + Conf.toCurrency + ")   Filled Orders: " + gb.fills);
        logRows.push("  Current price  : " + gb.currentMarketPrice + "(" + Conf.toCurrency + ")");
        logRows.push("-------------------------------------------------------------");
        if (Conf.logLvl > 0) {
            for (var row in logRows) {
                this.log(row);
            }
        }
        if(Conf.logOnFile){
            for (var row in logRows) {
                logger.info(row);
            }
        }
    }
}