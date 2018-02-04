const gb = require('./GlobalVariables');


class Analyzer {

	isBuySpeedIncreasing() { return gb.currentBuySpeed > gb.lastBuySpeed }
	isSellSpeedIncreasing() { return gb.currentSellSpeed > gb.lastSellSpeed }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }

    isMarketGoingFromDownToUp() {
    	return isBuySpeedIncreasing && (gb.lastSellSpeed > 0) && (gb.currentSellSpeed < 0);
    }

    isMarketGoingFromUpToDown() {
    	return isSellSpeedIncreasing && (gb.lastBuySpeed > 0) && (gb.currentBuySpeed < 0);
    }

}


module.exports = new Analyzer();