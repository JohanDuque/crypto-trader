const gb = require('./GlobalVariables');
const conf = require('./Configuration');
const moment = require('moment');

class Analyzer {
    constructor() {
        var me = this;
        me.lastSamplesTimestamp = null;
        me.priceSamples = [];
        me.priceDirection = conf.PRICE_DIRECTION_UNKNOWN;

        gb.eventManager.on('currentMarketPriceUpdate', function() {
            if (me.lastSamplesTimestamp && me.lastSamplesTimestamp.add(conf.analyzer.MarketDirection.freqOfSampling, "s") > moment()) {
                return;
            }
            me.lastSamplesTimestamp = moment();
            me.priceSamples.push(gb.currentMarketPrice);
            console.log('pppppp',me.priceSamples)
            if (me.priceSamples.length < conf.analyzer.MarketDirection.samplesQuantityForEval) {
                return;
            }
            if (me.priceSamples.length > conf.analyzer.MarketDirection.samplesQuantityForEval) {
                me.priceSamples.shift();
            }
            var _priceDirection = conf.PRICE_STABLE;
            if (me.priceSamples[0] < me.priceSamples[conf.analyzer.MarketDirection.samplesQuantityForEval - 1]) {
                _priceDirection = conf.PRICE_GROWING;
            }
            if (me.priceSamples[0] > me.priceSamples[conf.analyzer.MarketDirection.samplesQuantityForEval - 1]) {
                _priceDirection = conf.PRICE_FALLING;
            }
            console.log('LLLLLLLLLLLLLLLLLLLLLLLLLLLLL');
            console.log('this.priceSamples', me.priceSamples);
            console.log('_priceDirection', _priceDirection);
            console.log('LLLLLLLLLLLLLLLLLLLLLLLLLLLLL');
            if (_priceDirection != me.priceDirection) {
                me.priceDirection = _priceDirection;
                gb.eventManager.emit('priceDirectionChange');
            }
        });

    }

    isRatioIncreasing() { return gb.currentMarketRatio > gb.lastMarketRatio }

    areBuyersTwiceSellers() { return gb.currentBuyers / gb.currentSellers > 2; }
    areSellersTwiceBuyers() { return gb.currentSellers / gb.currentBuyers > 2; }




    isPriceGrowing() { return this.priceDirection === onf.PRICE_GROWING };
    isPriceStable() { return this.priceDirection === onf.PRICE_STABLE };
    isPriceFalling() { return this.priceDirection === onf.PRICE_FALLING };

}
module.exports = new Analyzer();