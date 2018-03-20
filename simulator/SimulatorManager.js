const ExchangeManager = require('../actors/ExchangeManager');
const Logger = require('../commons/Logger');

class SimulatorManager extends ExchangeManager {

    placeOrder(params) {
         Logger.log(1, "Place order simulated,  side: " + params.side + " price: " +params.price);
         return new Promise((resolve, reject) => resolve());
     }

    cancelOrder(orderId) {
        Logger.log(1, "Cancel order simulated, OrderId: " + orderId);
        return new Promise((resolve, reject) => resolve());
    }

}

module.exports = new SimulatorManager();