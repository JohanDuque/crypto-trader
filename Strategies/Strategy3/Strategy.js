const OrderManager = require('../../OrderManager');
const GdaxManager = require('../../GdaxManager');
const C = require('../../Constants');
module.exports = class Strategy {
    constructor(params) {
        this.gdaxManager = new GdaxManager(params.conf);
        this.orderManager = new OrderManager({ account: params.account, exchangeManager: this.gdaxManager });
    }

    start() {
        var me = this;
        me.gdaxManager.askForInfo().then(() => {
            me.orderManager.buy(this.gdaxManager.marketCanSellAt);
            me.tradeCycle();
        }, err => {
            setTimeout(function() { me.start(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    tradeCycle() {
        var me = this;
        me.gdaxManager.askForInfo().then(() => {
            me.makeChoice();
            setTimeout(function() { me.tradeCycle() }, C.TRADE_INTERVAL_MILLIS);
        }, err => {
            setTimeout(function() { me.tradeCycle(); }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    makeChoice() {
        if(this.orderManager.orderInPending ){
            if(this.orderManager.lastAction === C.SELL && this.gdaxManager.asksAverage > this.orderManager.lastSellPrice){
                this.orderManager.revokeOrder();
            }
            if(this.orderManager.lastAction === C.BUY && this.gdaxManager.bidsAverage < this.orderManager.lastBuyPrice){
                this.orderManager.revokeOrder();
            }
        }
        if(!this.orderManager.orderInPending ){
        if (this.orderManager.lastAction === C.SELL && this.gdaxManager.bidsAverage < this.orderManager.lastSellPrice) {
            this.orderManager.buy(this.gdaxManager.bidsAverage);
        }
        if (this.orderManager.lastAction == C.BUY && this.gdaxManager.asksAverage > this.orderManager.lastBuyPrice) {
            this.orderManager.sell(this.gdaxManager.asksAverage);
        }
    }
    }

}