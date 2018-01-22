module.exports = class Account {
    constructor(params) {
        this.profits = 0;
        this.startAmountToTrade = params.startAmountToTrade || 0;
        this.eth = 0;
        this.eur = this.startAmountToTrade;
    }
}