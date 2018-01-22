const C = require('./Constants');
module.exports = class OrderManager {
    constructor(params) {
        this.orderInPending = params.orderInPending || false;
        this.lastAction = params.lastAction || null;
        this.lastSellPrice = params.lastSellPrice || null;
        this.lastBuyPrice = params.lastBuyPrice || null;
        this.account = params.account;
        this.exchangeManager = params.exchangeManager;
    }

    buy(price) {
        this.lastBuyPrice = price;
        this.lastAction = C.BUY;
        this.orderInPending = true;
        this.startWaitingExecution();
        console.log("\n ------- Buying at: " + this.lastBuyPrice + "(EUR) ------- ");
    }

    buyExecuted(price) {
        this.account.eth = this.account.eur / price;
        this.account.eur = 0;
        this.orderInPending = false;
        console.log("\n ------- Buied ------- ");
    }

    sell(price) {
        this.lastSellPrice = price;
        this.lastAction = C.SELL;
        this.orderInPending = true;
        this.startWaitingExecution();
        console.log("\n +++++++ Selling at: " + price + "(EUR) +++++++ ");
    };

    sellExecuted(price) {
        this.account.profits += price * this.account.eth - this.lastBuyPrice * this.account.eth;
        this.account.eur = this.account.eth * price;
        this.account.eth = 0;
        this.orderInPending = false;
        console.log("\n +++++++ Selled +++++++ ");
        console.log("\n +++++++ Capitale: " + this.account.eur + "(EUR) +++++++");
        console.log("\n +++++++ Profitto: " + this.account.profits + "(EUR) +++++++");
    }

    startWaitingExecution() {
        var me = this;
        me.ceckIfOrderCanFill().then(() => {
            if (me.orderInPending) {
                setTimeout(function() { me.startWaitingExecution() }, C.CECK_INTERVAL_MILLIS);
            }
        });
    }

    ceckIfOrderCanFill() {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.exchangeManager.askForInfo().then(() => {
                if (me.lastAction === C.BUY && me.exchangeManager.marketCanSellAt <= me.lastBuyPrice) {
                    me.buyExecuted(me.exchangeManager.marketCanSellAt);
                }
                if (me.lastAction === C.SELL && me.exchangeManager.marketCanBuyAt >= me.lastSellPrice) {
                    me.sellExecuted(me.exchangeManager.marketCanBuyAt);
                }
                resolve();
            }, err => reject(err));
        });
    }
}