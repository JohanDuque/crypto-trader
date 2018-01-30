const gb = require('./GlobalVariables');


class Analyzer {

	isBuySpeedIncreasing() { return gb.currentBuySpeed > gb.lastBuySpeed }
	isSellSpeedIncreasing() { return gb.currentSellSpeed > gb.lastSellSpeed }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }

}


module.exports = new Analyzer();