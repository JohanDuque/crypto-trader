const verbose		  = false;
const productType	  = 'ETH-EUR';
const amountToTrade   = 0.01;//ETH
const investment	  = 10;//EUR
const errorTolerance  = 300;

const pollingInterval = 7;
const tradeSampleSize = 7;
const orderFillError  = 1.1;

exports.pollingInterval = pollingInterval;
exports.amountToTrade = amountToTrade;
exports.investment = investment;
exports.errorTolerance = errorTolerance;
exports.productType = productType;
exports.tradeSampleSize = tradeSampleSize;
exports.orderFillError = orderFillError;
exports.verbose = verbose;

