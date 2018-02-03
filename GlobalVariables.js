const config = require('./Configuration');

class GlobalVariables {
    constructor() {
        this.profits = config.investment;
        this.iteration = 0;
        this.bidsAverage = 0;
        this.lastBuyPrice = 0;
        this.asksAverage = 0;
        this.lastSellPrice = 0;
        this.currentMarketPrice = 0;
        this.currentBuyers = 0;
        this.currentSellers = 0;
        this.lastAction = config.SELL;
        this.buyOrders = 0;
        this.sellOrders = 0;
        this.errorCount = 0;
        this.lastOrderWasFilled = true;
        this.fills = 0;
        this.tradeHistory= null;
        this.lastBuySpeed = 0; //buyers/sellers
        this.currentBuySpeed = 0; //buyers/sellers
        this.lastSellSpeed = 0; //sellers/buyers
        this.currentSellSpeed = 0; //sellers/buyers
    }
}

module.exports = new GlobalVariables();
//const gb = new GlobalVariables();
//console.log(gb);
// new GlobalVariables();