const Conf = require('./Configuration');
const gb = require('./GlobalVariables');
//var bunyan = require('bunyan');
/*var logger = bunyan.createLogger({name: 'myapp',
    streams: [{
        type: 'rotating-file',
        path: './log/crypto' + Conf.strategy +'.log',
        period: '6h',   // daily rotation
        count: 4        // keep 3 back copies
    }]});*/

var logger = require('tracer').dailyfile({root:'./logs', maxLogFiles: 10, allLogsFileName: Conf.traderId+"@"});
 

module.exports = class Logger {
    static log(msg) {
        
        console.log(msg);
        
        if(Conf.logOnFile){
            logger.info(msg);
        }
    }

    static printReport() {
        this.log("-------------------------------------------------------------");
        this.log("  " + new Date() + "   " + "Iteration #" + gb.iteration);
        this.log("  Trader# " + Conf.traderId + "        Errors: " + gb.errorCount);
        this.log("\n  Last Buy Order : " + gb.lastBuyPrice + "(" + Conf.toCurrency + ")        Buy Orders: " + gb.buyOrders);
        this.log("  Last Sell Order: " + gb.lastSellPrice + "(" + Conf.toCurrency + ")       Sell Orders: " + gb.sellOrders);
        this.log("  Profits        : " + gb.profits + "(" + Conf.toCurrency + ")   Filled Orders: " + gb.fills);
        this.log("  Current price  : " + gb.currentMarketPrice + "(" + Conf.toCurrency + ")");
        this.log("-------------------------------------------------------------");
    }
}