const params = require('../params.json');

class Configuration {
    constructor() {
        this.logLvl = params.logLvl; //(0-5) from nothing to verbose
        this.logOnFile = params.simulateFromRecording ? false : params.logOnFile;
        this.recordInfo = params.simulateFromRecording ? false : params.recordInfo;
        this.exchange = params.simulateFromRecording ? 'SIMULATOR' : params.exchange;
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
        this.postOnlyFactor = params.postOnlyFactor;
        this.startTime = new Date();
        this.startDelay = params.startDelay;
        this.recordOnly = params.recordOnly;
        this.simulateFromRecording = params.recordOnly ? false : params.simulateFromRecording;
        this.recordingFileNames = params.recordingFileNames;

        this.SELL = 'sell';
        this.BUY = 'buy';
        this.traderId = this.strategy + "_" + this.minPollingInterval + "-"+this.maxPollingInterval+"_" +
            this.orderSize + this.fromCurrency + "_" +
            this.investment + this.toCurrency + "_" +
            this.tradeHistorySize + "_" + this.orderFillError;
    }
}

module.exports = Object.freeze(new Configuration());
