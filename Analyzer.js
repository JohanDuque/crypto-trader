const gb = require('./GlobalVariables');


class Analyzer {

	isRatioIncreasing() { return gb.currentMarketRatio > gb.lastMarketRatio }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }


}


module.exports = new Analyzer();