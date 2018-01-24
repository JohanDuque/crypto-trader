const params = require('./params.json');

module.exports = class Configuration {
    constructor() {
        this.verbose = params.verbose;
        this.productType = params.productType;
        this.fromCurrency=this.productType.split('-')[0];
		this.toCurrency=this.productType.split('-')[1];
        this.amountToTrade = params.amountToTrade;
        this.investment = params.investment;
        this.errorTolerance = params.errorTolerance;
        this.strategy = params.strategy;
        this.pollingInterval = params.pollingInterval;
        this.tradeSampleSize = params.tradeSampleSize;
        this.orderFillError = params.orderFillError;
    }
}

//const config = new Configuration();
//console.log(config);
// new Configuration(); 