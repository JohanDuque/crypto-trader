const C = require('./Constants');
let Conf;
module.exports = class OrderManager {
    constructor(params) {
        Conf = params.conf;
        this._orderInPending = params.orderInPending || false;
        this._lastAction = params.lastAction || null;
        this._lastSellPrice = params.lastSellPrice || null;
        this._lastBuyPrice = params.lastBuyPrice || null;
        this.account = params.account;
        this.exchangeManager = params.exchangeManager;
        this.orderHistory = [];
        this.buyTimes = 0;
        this.sellTimes = 0;
        this.fills = 0;
        this.eventManager = params.eventManager;
        var me = this;

    this.eventManager.on('buy',function(price) {
        me.buyTimes++;
        me.lastBuyPrice = price;
        me.lastAction = C.BUY;
        me.orderInPending = true;
        console.log("\n ------- Buying at: " + price + "(" + me.account.toCurrency + ") ------- Buy Times: " + me.buyTimes);
        me.startWaitingExecution();
    });

    this.eventManager.on('sell',function(price) {
        me.sellTimes++;
        me.lastSellPrice = price;
        me.lastAction = C.SELL;
        
        me.orderInPending = true;

        console.log("\n +++++++ Selling at: " + price + "(" + me.account.toCurrency + ") +++++++ Sell Times: " + me.sellTimes);
        me.startWaitingExecution();
    });


    this.eventManager.on('revokeOrder',function() {
        if (me.lastAction = C.SELL) {
            me.lastSellPrice = null;
        } else {
            me.lastBuyPrice = null;
        }
        if (me.orderHistory.length > 0) {
            me.lastAction = me.orderHistory[me.orderHistory.length - 1].action;
        } else {
            me.lastAction = null;
        }
        me.orderInPending = false;
        console.log("\n +++++++ Revoked +++++++ ");
    });

}

    get orderInPending(){
        return this._orderInPending;
    }
    
    set orderInPending(value){
        this._orderInPending = value;
        this.eventManager.emit('orderInPendingChange', this._orderInPending);
    }

    get lastAction(){
        return this._lastAction;
    }
    
    set lastAction(value){
        this._lastAction = value;
        this.eventManager.emit('lastActionChange', this._lastAction);
    }

    get lastSellPrice(){
        return this._lastSellPrice;
    }
    
    set lastSellPrice(value){
        this._lastSellPrice = value;
        this.eventManager.emit('lastSellPriceChange', this._lastSellPrice);
    }

    get lastBuyPrice(){
        return this._lastBuyPrice;
    }
    
    set lastBuyPrice(value){
        this._lastBuyPrice = value;
        this.eventManager.emit('lastBuyPriceChange', this._lastBuyPrice);
    }

    buyExecuted(price) {
        this.account.coin = this.account.amount / price;
        this.orderHistory.push({ action: this.lastAction, coin: this.account.coin, price: price });
        this.account.amount = 0;
        this.orderInPending = false;
        Conf.verbose ?  this.eventManager.emit('printReport') : null;
    }

    

    sellExecuted(price) {
        this.account.profits += price * this.account.coin - this.lastBuyPrice * this.account.coin;
        this.account.amount = this.account.coin * price;
        this.orderHistory.push({ action: this.lastAction, coin: this.account.coin, price: price });
        this.account.coin = 0;
        this.orderInPending = false;
        Conf.verbose ?  this.eventManager.emit('printReport') : null;
    }

   

    startWaitingExecution() {
        var me = this;

        var recallWaitingIfPending = function() {
            if (me.orderInPending) {
                setTimeout(function() { me.startWaitingExecution() }, C.CECK_INTERVAL_MILLIS);
            }
        }

        me.ceckIfOrderCanFill().then(() => {
            recallWaitingIfPending();
        }, err => {
            recallWaitingIfPending();
        });
    }

    ceckIfOrderCanFill() {
        var me = this;
        return new Promise(function(resolve, reject) {
            if (!Conf.fillOrderFromHistory) {
                me.exchangeManager.askForInfo().then(() => {
                    if (me.lastAction === C.BUY && me.exchangeManager.marketCanSellAt <= me.lastBuyPrice) {
                        me.buyExecuted(me.exchangeManager.marketCanSellAt);
                    }
                    if (me.lastAction === C.SELL && me.exchangeManager.marketCanBuyAt >= me.lastSellPrice) {
                        me.sellExecuted(me.exchangeManager.marketCanBuyAt);
                    }
                    resolve();
                }, err => reject(err));
            } else {
                let filteredArray;
                if (me.lastAction === C.BUY) {
                    filteredArray = me.exchangeManager.tradeHistory.filter((data) => { return Math.abs(me.lastBuyPrice - data.price) <= Conf.orderFillError });
                } else {
                    filteredArray = me.exchangeManager.tradeHistory.filter((data) => { return Math.abs(me.lastSellPrice - data.price) <= Conf.orderFillError });
                }
                var lastOrderWasFilled = false;
                if (filteredArray.length > 0 && me.lastAction === C.BUY) {
                    me.buyExecuted(me.exchangeManager.marketCanSellAt);
                    lastOrderWasFilled = true;
                }
                if (filteredArray.length > 0 && me.lastAction === C.SELL) {
                    me.sellExecuted(me.exchangeManager.marketCanBuyAt);
                    lastOrderWasFilled = true;
                }
                if (lastOrderWasFilled) {
                    me.fills++;
                    //me.eventManager.emit('printReport');
                };
                resolve();
            }
        });
    }

}