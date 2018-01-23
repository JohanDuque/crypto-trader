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
            console.log('VVVVV',err);
            setTimeout(function() { me.start(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    tradeCycle() {
        var me = this;
        me.iteration++;
        me.gdaxManager.askForInfo().then(() => {
            if(!me.verifiState()){
                return;
            }
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
        let betterAverage = this.gdaxManager.currentMarketPrice;
        if (this.gdaxManager.sells > this.gdaxManager.buys && this.orderManager.lastAction !== C.BUY && this.orderManager.lastSellPrice >= this.gdaxManager.currentMarketPrice) {
            betterAverage = (this.gdaxManager.bidsAverage + this.gdaxManager.currentMarketPrice) / 2;
            if (Conf.verbose) console.log("Improved Average: " + betterAverage);
            this.orderManager.buy(betterAverage);
        }

        if (this.gdaxManager.buys > this.gdaxManager.sells && this.orderManager.lastAction !== C.SELL && this.orderManager.lastBuyPrice > this.gdaxManager.currentMarketPrice) {
            betterAverage = (this.gdaxManager.asksAverage + this.gdaxManager.currentMarketPrice) / 2;
            if (Conf.verbose) console.log("Improved Average: " + betterAverage);
            this.orderManager.sell(betterAverage);
        }
    }

    verifiState(){
        /*if (this.account.profits <= 0) {
            console.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
            clearInterval(this.tradeCycleTimer);
            return false;
        }

        if (this.gdaxManager.errors > Conf.errorTolerance) {
            console.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
            clearInterval(this.tradeCycleTimer);
            return false;
        }*/
        return true;
    }

}