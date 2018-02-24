const params = require('./params.json');

class Configuration {
    constructor() {
        this.logLvl = params.logLvl; //(0-5) from nothing to verbose
        this.logOnFile = params.simulateFromRecordign ? params.logOnFile :false;
        this.recordInfo = params.simulateFromRecordign ? params.recordInfo :false;
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
        this.simulateFromRecording = params.simulateFromRecording;
        this.recordingFile = params.recordingFile;

        this.SELL = 'sell';
        this.BUY = 'buy';
        this.traderId = this.strategy + "_" + this.minPollingInterval + "-"+this.maxPollingInterval+"_" +
            this.orderSize + this.fromCurrency + "_" +
            this.investment + this.toCurrency + "_" +
            this.tradeHistorySize + "_" + this.orderFillError;
    }
}

module.exports = Object.freeze(new Configuration());
//const config = new Configuration();
//console.log(config);
// new Configuration();