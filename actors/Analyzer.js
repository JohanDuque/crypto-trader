const gb = require('../commons/GlobalVariables');

class Analyzer {
    isBuySpeedIncreasing(){ return gb.currentBuySpeed > gb.lastBuySpeed;}
    isSellSpeedIncreasing(){ return gb.currentSellSpeed > gb.lastSellSpeed;}

    areBuyersTwiceSellers(){ return gb.currentSellers / gb.currentBuyers > 2;}
    areSellersTwiceBuyers(){ return gb.currentBuyers / gb.currentSellers > 2;}

    isMarketGoingFromDownToUp(){ return  this.isBuySpeedIncreasing() && (gb.lastSellSpeed > 0.1) && (gb.currentSellSpeed < 0.1);}
    isMarketGoingFromUpToDown(){ return  this.isSellSpeedIncreasing() && (gb.lastBuySpeed > 0.1) && (gb.currentBuySpeed < 0.5);}

    isLastBuyLowerByFactor(factor){ return gb.currentMarketPrice < gb.lastBuyPrice - (gb.lastBuyPrice * factor);}
    isLastBuyUpperByFactor(factor){ return gb.currentMarketPrice > gb.lastBuyPrice + (gb.lastBuyPrice * factor);}
}


module.exports = new Analyzer();