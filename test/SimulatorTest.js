const assert = require('assert');
const conf = require('../commons/Configuration');
const gb = require('../commons/GlobalVariables');
const Simulator = require('../simulator/Simulator');

describe('Simulator', function () {

    describe('checkFills() after BUY order', function () {
        beforeEach(function () {
            gb.buyOrders = 1;
            gb.lastAction = conf.BUY;
            gb.lastBuyPrice = 100;
            gb.lastOrderWasFilled = false;
            gb.fills = 0;
        });

        it('should increase fills by 1', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:42.296Z",
                "trade_id": 41118622,
                "price": "100",
                "size": conf.orderSize,
                "side": "buy"
            }];
            Simulator.checkFills();
            assert.equal(gb.fills, 1);
        });

        it('should increase fills by 1', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:42.296Z",
                "trade_id": 41118622,
                "price": "101",
                "size": conf.orderSize + 1,
                "side": "buy"
            }];
            Simulator.checkFills();
            assert.equal(gb.fills, 1);
        });

        it('last order should be filled', function () {
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, true);
        });

        it('should increase fills by 1', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:42.295Z",
                "trade_id": 41118622,
                "price": "100",
                "size": conf.orderSize + 1,
                "side": "buy"
            }];
            Simulator.checkFills();
            assert.equal(gb.fills, 1);
        });

        it('should NOT increase fills by 1', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:42.295Z",
                "trade_id": 41119612,
                "price": "111",
                "size": conf.orderSize + 1,
                "side": "sell"
            }];
            Simulator.checkFills();
            assert.equal(gb.fills, 0);
        });

        it('last order should NOT be filled', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:42.296Z",
                "trade_id": 41116623,
                "price": "99",
                "size": conf.orderSize + 1,
                "side": "buy"
            }];
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, false);
        });

        it('should NOT increase fills by 1', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:42.295Z",
                "trade_id": 41118622,
                "price": "900",
                "size": conf.orderSize - 1,
                "side": "buy"
            }];
            Simulator.checkFills();
            assert.equal(gb.fills, 0);
        });
    });

    describe('checkFills() after SELL order', function () {
        beforeEach(function () {
            gb.buyOrders = 1;
            gb.lastAction = conf.SELL;
            gb.lastSellPrice = 100;
            gb.lastOrderWasFilled = false;
            gb.fills = 0;
        });

        it('should increase fills by 1', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:52.881Z",
                "trade_id": 41118626,
                "price": "100",
                "size": conf.orderSize + 1,
                "side": "sell"
            }];
            Simulator.checkFills();
            assert.equal(gb.fills, 1);
        });

        it('last order should be filled', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:52.881Z",
                "trade_id": 41118626,
                "price": "111",
                "size": conf.orderSize + 1,
                "side": "sell"
            }];
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, true);
        });

        it('last order should be filled', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:52.881Z",
                "trade_id": 41118626,
                "price": "100",
                "size": conf.orderSize,
                "side": "sell"
            }];
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, true);
        });

        it('last order should NOT be filled', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:52.881Z",
                "trade_id": 41118626,
                "price": "99",
                "size": conf.orderSize,
                "side": "sell"
            }];
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, false);
        });

        it('last order should NOT be filled', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:52.881Z",
                "trade_id": 41118626,
                "price": "100",
                "size": conf.orderSize - 1,
                "side": "sell"
            }];
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, false);
        });

        it('last order should NOT be filled', function () {
            gb.tradeHistory = [{
                "time": "2018-04-05T08:16:52.881Z",
                "trade_id": 41118626,
                "price": "100",
                "size": conf.orderSize - 1,
                "side": "buy"
            }];
            Simulator.checkFills();
            assert.equal(gb.lastOrderWasFilled, false);
        });
    });
});