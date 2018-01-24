module.exports = class Reporting {
    constructor(params) {
    	this.account = params.account;
    	this.orderManager = params.orderManager;
    	this.exchangeManager = params.exchangeManager;
    	this.strategy = params.strategy;
		var me = this;
    	params.eventManager.on('printReport', function(){
        	console.log("\n--------------------------------------------------------------");
        	console.log("  " + new Date() + "   " + "Iteration #" + me.strategy.iteration);
        	console.log("  Trader# " + me.account.traderId + "         Errors: " + me.exchangeManager.errors);
        	console.log("  Last Buy Order : " + me.orderManager.lastBuyPrice + "(" + me.account.toCurrency + ")        Buy Orders: " + me.orderManager.buyTimes);
        	console.log("  Last Sell Order: " + me.orderManager.lastSellPrice + "(" + me.account.toCurrency + ")       Sell Orders: " + me.orderManager.sellTimes);
        	console.log("  Profits        : " + me.account.profits + "(" + me.account.toCurrency + ")   Filled Orders: " + me.orderManager.fills);
       		console.log("  Current price  : " + me.exchangeManager.currentMarketPrice + "(" + me.account.toCurrency + ")");
        	console.log("-------------------------------------------------------------\n");
    	});
    }
}