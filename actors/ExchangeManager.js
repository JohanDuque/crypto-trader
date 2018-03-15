class ExchangeManager {
    placeOrder(params) {
        throw new Error('You have to implement this method!');
    }

    cancelOrder(orderId) {
        throw new Error('You have to implement this method!');
    }

    getFills() {
        throw new Error('You have to implement this method!');
    }

    getAccounts() {
        throw new Error('You have to implement this method!');
    }

    getAccount() {
        throw new Error('You have to implement this method!');
    }


    getAccountHistory() {
        throw new Error('You have to implement this method!');
    }

    getAverage(items) {
        let sumItems = items.reduce((accumulator, item) => {
            //"item": [ price, size, num-orders ]
            return accumulator + parseInt(item[0]);
        }, 0);
        return sumItems / items.length;
    }

    getOrderBook() {
        throw new Error('You have to implement this method!');
    }


    getTradeHistory() {
        throw new Error('You have to implement this method!');
    }
}

module.exports = ExchangeManager;