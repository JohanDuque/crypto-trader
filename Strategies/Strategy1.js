const OrderManager = require('../OrderManager');
const GdaxManager = require('../GdaxManager');
const C = require('../Constants');
module.exports = class Strategy {
    constructor(params) {
        this.gdaxManager = new GdaxManager();
        this.orderManager = new OrderManager({ account: params.account, exchangeManager: this.gdaxManager });
    }

    start() {
        this.gdaxManager.askForInfo().then(() => {
            this.orderManager.buy(this.gdaxManager.marketCanSellAt);
            this.tradeCycle();
        });
    }

    tradeCycle() {
        var me = this;
        this.gdaxManager.askForInfo().then(() => {
            if (!me.orderManager.orderInPending) {
                me.makeChoice();
            }
            setTimeout(function() { me.tradeCycle() }, C.TRADE_INTERVAL_MILLIS);
        });
    }

    makeChoice() {
        if ( /*sells > buys &&*/ !this.orderManager.orderInPending && this.orderManager.lastAction === C.SELL /*&& this.orderManager.lastSellPrice >= this.gdaxManager.buyAverage*/ ) {
            this.orderManager.buy(this.gdaxManager.currentPrice);
        }
        if ( /*buys > sells &&*/ !this.orderManager.orderInPending && this.orderManager.lastAction == C.BUY && this.gdaxManager.sellAverage > this.orderManager.lastBuyPrice) {
            this.orderManager.sell(this.gdaxManager.sellAverage);
        }
    }
}