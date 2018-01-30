const params = require('./params.json');

class Configuration {
    constructor() {
        this.logLvl = params.logLvl; //(0-5) from nothing to verbose
        this.logOnFile = params.logOnFile;
        this.productType = params.productType;
        this.fromCurrency = this.productType.split('-')[0];
        this.toCurrency = this.productType.split('-')[1];
        this.orderSize = params.orderSize;
        this.investment = params.investment;
        this.errorTolerance = params.errorTolerance;
        this.strategy = params.strategy;
        this.minPollingInterval = params.minPollingInterval;
        this.maxPollingInterval = params.maxPollingInterval;
        this.tradeHistorySize = params.tradeHistorySize;
        this.orderFillError = params.orderFillError;
        this.startTime = new Date();
        this.startDelay = params.startDelay;
        this.analyzer = params.Analyzer

        this.SELL = 'sell';
        this.BUY = 'buy';

        this.PRICE_GROWING = 'growing';
        this.PRICE_STABLE = 'stable';
        this.PRICE_FALLING = 'falling';
        this.PRICE_DIRECTION_UNKNOWN = 'unknown';

        this.traderId = this.strategy + "|" + this.minPollingInterval + "-"+this.maxPollingInterval+"|" +
            this.orderSize + this.fromCurrency + "|" +
            this.investment + this.toCurrency + "|" +
            this.tradeHistorySize + "|" + this.orderFillError;
    }
}

module.exports = Object.freeze(new Configuration());
//const config = new Configuration();
//console.log(config);
// new Configuration();