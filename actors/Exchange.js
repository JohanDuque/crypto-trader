const conf = require('../commons/Configuration');
const GdaxManager = require('../Gdax/GdaxManager');

class Exchange {
    constructor(exchange) {
        switch (exchange){
            case 'GDAX':
                return GdaxManager;
            default:
                throw new Error('There is no ' + exchange + ' exchange implementation!');
        }
    }
}

module.exports = new Exchange(conf.exchange);