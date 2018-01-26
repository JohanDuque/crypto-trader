const OrderManager = require('../../OrderManager');
const GdaxManager = require('../../GdaxManager');
const C = require('../../Constants');
let Conf;
module.exports = class Strategy {
    constructor(params) {
        this.gdaxManager = new GdaxManager(params);
        params.exchangeManager = this.gdaxManager;
        this.orderManager = new OrderManager(params);
        this.gdaxManager.orderManager = this.orderManager;
        this.account = params.account;
        this.iteration = 0;
        this.tradeCycleTimer = null;
        Conf = params.conf;
    }

    start() {
        var me = this;
        me.gdaxManager.askForInfo().then(() => {
            me.orderManager.buy(me.gdaxManager.marketCanSellAt);
            me.tradeCycle();
        }, err => {
            setTimeout(function() { me.start(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    tradeCycle() {
        var me = this;
        me.iteration++;
        me.gdaxManager.askForInfo().then(() => {
            if (!me.orderManager.orderInPending) {
                me.makeChoice();
            }
            me.tradeCycleTimer = setTimeout(function() { me.tradeCycle() }, C.TRADE_INTERVAL_MILLIS);
            if (Conf.verbose) {
                me.gdaxManager.printReport();
            }
        }, err => {
            me.tradeCycleTimer = setTimeout(function() { me.tradeCycle(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    makeChoice() {
        if (this.gdaxManager.sells > this.gdaxManager.buys && this.orderManager.lastAction !== C.BUY && this.orderManager.lastSellPrice >= this.gdaxManager.bidsAverage) {
            this.orderManager.buy(this.gdaxManager.bidsAverage);
        }

        if (this.gdaxManager.buys > this.gdaxManager.sells && this.orderManager.lastAction !== C.SELL && this.gdaxManager.asksAverage > this.orderManager.lastBuyPrice) {
            this.orderManager.sell(this.gdaxManager.asksAverage);
        }
    }

}