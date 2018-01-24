const C = require('../../Constants');
let Conf;
module.exports = class Strategy {
    constructor(params) {
        this.exchangeManager = params.exchangeManager;
        this.orderManager = params.orderManager;
        this.account = params.account;
        this.eventManager = params.eventManager;
        this.iteration = 0;
        this.tradeCycleTimer = null;
        Conf = params.conf;
    }

    start() {
        var me = this;
        me.exchangeManager.askForInfo().then(() => {
            me.orderManager.buy(me.exchangeManager.marketCanSellAt);
            me.tradeCycle();
        }, err => {
            console.log('%%%%%%%%%%%%%%%%',err);
            setTimeout(function() { me.start(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    tradeCycle() {
        var me = this;
        me.iteration++;
        me.exchangeManager.askForInfo().then(() => {
            if(!me.verifiState()){
                return;
            }
            if (!me.orderManager.orderInPending) {
                me.makeChoice();
            }
            me.tradeCycleTimer = setTimeout(function() { me.tradeCycle() }, C.TRADE_INTERVAL_MILLIS);
            if (Conf.verbose) {
                me.eventManager.emit('printReport');
            }
        }, err => {
            me.tradeCycleTimer = setTimeout(function() { me.tradeCycle(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    makeChoice() {
        let betterAverage = this.exchangeManager.currentMarketPrice;
        if (this.exchangeManager.sells > this.exchangeManager.buys && this.orderManager.lastAction !== C.BUY && this.orderManager.lastSellPrice >= this.exchangeManager.currentMarketPrice) {
            betterAverage = (this.exchangeManager.bidsAverage + this.exchangeManager.currentMarketPrice) / 2;
            if (Conf.verbose) console.log("Improved Average: " + betterAverage);
            this.orderManager.buy(betterAverage);
        }

        if (this.exchangeManager.buys > this.exchangeManager.sells && this.orderManager.lastAction !== C.SELL && this.orderManager.lastBuyPrice > this.exchangeManager.currentMarketPrice) {
            betterAverage = (this.exchangeManager.asksAverage + this.exchangeManager.currentMarketPrice) / 2;
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

        if (this.exchangeManager.errors > Conf.errorTolerance) {
            console.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
            clearInterval(this.tradeCycleTimer);
            return false;
        }*/
        return true;
    }

}