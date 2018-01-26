const C = require('../../Constants');
let Conf;
module.exports = class Strategy {
    constructor(params) {
        this.exchangeManager = params.exchangeManager;
        this.orderInPending = false;
        this.lastAction = null;
        this.lastSellPrice = null;
        this.lastBuyPrice = null;
        //this.account = params.account;
        this.eventManager = params.eventManager;
        this.iteration = 0;
        this.tradeCycleTimer = null;
        Conf = params.conf;
        var me = this;
        this.eventManager.on('orderInPendingChange', orderInPending => { me.orderInPending = orderInPending });
        this.eventManager.on('lastActionChange', lastAction => { me.lastAction = lastAction });
        this.eventManager.on('lastSellPriceChange', lastSellPrice => { me.lastSellPrice = lastSellPrice });
        this.eventManager.on('lastBuyPriceChange', lastBuyPrice => { me.lastBuyPrice = lastBuyPrice });
    }

    start() {
        var me = this;
        me.exchangeManager.askForInfo().then(() => {
            this.eventManager.emit('buy', me.exchangeManager.marketCanSellAt);
            me.tradeCycle();
        }, err => {
            console.log('%%%%%%%%%%%%%%%%', err);
            setTimeout(function() { me.start(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    tradeCycle() {
        var me = this;
        me.iteration++;
        me.exchangeManager.askForInfo().then(() => {
            if (!me.verifiState()) {
                return;
            }
            if (!me.orderInPending) {
                me.makeChoice();
            }
            me.tradeCycleTimer = setTimeout(function() { me.tradeCycle() }, C.TRADE_INTERVAL_MILLIS);
            if (Conf.verbose) {
                //me.eventManager.emit('printReport');
            }
        }, err => {
            me.tradeCycleTimer = setTimeout(function() { me.tradeCycle(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    makeChoice() {
        let betterAverage = this.exchangeManager.currentMarketPrice;
        if (/*this.exchangeManager.sells > this.exchangeManager.buys &&*/ this.lastAction !== C.BUY && this.lastSellPrice >= this.exchangeManager.currentMarketPrice) {
            betterAverage = (this.exchangeManager.bidsAverage + this.exchangeManager.currentMarketPrice) / 2;
            if (Conf.verbose) console.log("Improved Average: " + betterAverage);
            this.eventManager.emit('buy', betterAverage);
        }

        if (/*this.exchangeManager.buys > this.exchangeManager.sells && */this.lastAction !== C.SELL && this.lastBuyPrice < this.exchangeManager.currentMarketPrice) {
            betterAverage = (this.exchangeManager.asksAverage + this.exchangeManager.currentMarketPrice) / 2;
            if (Conf.verbose) console.log("Improved Average: " + betterAverage);
            this.eventManager.emit('sell', betterAverage);
        }
    }

    verifiState() {
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