const conf = require('../commons/Configuration');
const GdaxManager = require('../Gdax/GdaxManager');
const Simulator = require('../simulator/SimulatorManager');

class Exchange {
    constructor(exchange) {
        switch (exchange) {
            case 'SIMULATOR':
                return Simulator;
            case 'GDAX':
                return GdaxManager;
            default:
                throw new Error('There is no ' + exchange + ' exchange implementation!');
        }
    }
}

module.exports = new Exchange(conf.exchange);