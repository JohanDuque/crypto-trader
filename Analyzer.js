const gb = require('./GlobalVariables');


class Analyzer {

	isVelocityIncreasing() { return gb.currentMarketVelocity > gb.lastMarketVelocity }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }

}


module.exports = new Analyzer();