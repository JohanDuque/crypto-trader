module.exports = class Account {
    constructor(params) {
        this.profits = 0;
        this.startAmountToTrade = params.amountToTrade || 0;
        [this.fromCurrency, this.toCurrency] = params.productType.split('-')
        this.coin = 0;
        this.amount = this.startAmountToTrade;
        this.traderId = params.pollingInterval + "s|" +
            params.amountToTrade + params.fromCurrency + "|" +
            params.investment + params.toCurrency + "|" +
            params.tradeSampleSize + "|" + params.orderFillError;
    }
}