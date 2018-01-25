const params = require('./params.json');

class Configuration {
    constructor() {
        this.logLvl = params.logLvl; //(0-5) from nothing to verbose
        this.productType = params.productType;
        this.fromCurrency = this.productType.split('-')[0];
        this.toCurrency = this.productType.split('-')[1];
        this.orderSize = params.orderSize;
        this.investment = params.investment;
        this.errorTolerance = params.errorTolerance;
        this.strategy = params.strategy;
        this.pollingInterval = params.pollingInterval;
        this.tradeSampleSize = params.tradeSampleSize;
        this.orderFillError = params.orderFillError;
        this.startTime = new Date();
        this.startDelay = params.startDelay;

        this.SELL = 'sell';
        this.BUY = 'buy';
        this.traderId = this.strategy + "|" + this.pollingInterval + "s|" +
            this.orderSize + this.fromCurrency + "|" +
            this.investment + this.toCurrency + "|" +
            this.tradeSampleSize + "|" + this.orderFillError;
    }
}

module.exports = Object.freeze(new Configuration());
//const config = new Configuration();
//console.log(config);
// new Configuration();