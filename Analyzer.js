const gb = require('./GlobalVariables');
const Logger = require('./Logger');

class Analyzer {

    isBuySpeedIncreasing() { return gb.currentBuySpeed > gb.lastBuySpeed }
    isSellSpeedIncreasing() { return gb.currentSellSpeed > gb.lastSellSpeed }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }

    isMarketGoingFromDownToUp() {
        return this.isBuySpeedIncreasing() && (gb.lastSellSpeed > 1) && (gb.currentSellSpeed < 1);
    }

    isMarketGoingFromUpToDown() {
        return this.isSellSpeedIncreasing() && (gb.lastBuySpeed > 1) && (gb.currentBuySpeed < 1);
    }

}


module.exports = new Analyzer();