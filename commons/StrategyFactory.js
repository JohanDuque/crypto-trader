const config = require('./Configuration');
//TODO use fs for the requires
const Strategy_V1 = require('../strategies/Strategy_V1');
const Strategy_V2 = require('../strategies/Strategy_V2');
const Strategy_V3 = require('../strategies/Strategy_V3');
const Strategy_V4 = require('../strategies/Strategy_V4');
const Strategy_V5 = require('../strategies/Strategy_V5');
const Strategy_V6 = require('../strategies/Strategy_V6');
const Strategy_V7 = require('../strategies/Strategy_V7');
const Strategy_V8 = require('../strategies/Strategy_V8');
const Strategy_V9 = require('../strategies/Strategy_V9');
const Strategy_V10 = require('../strategies/Strategy_V10');
const Strategy_V11 = require('../strategies/Strategy_V11');
const Strategy_V12 = require('../strategies/Strategy_V12');


const strategies = new Map();
strategies.set('V1', Strategy_V1);
strategies.set('V2', Strategy_V2);
strategies.set('V3', Strategy_V3);
strategies.set('V4', Strategy_V4);
strategies.set('V5', Strategy_V5);
strategies.set('V6', Strategy_V6);
strategies.set('V7', Strategy_V7);
strategies.set('V8', Strategy_V8);
strategies.set('V9', Strategy_V9);
strategies.set('V10', Strategy_V10);
strategies.set('V11', Strategy_V11);
strategies.set('V12', Strategy_V12);

class StrategyFactory {
    getStrategy() {return strategies.get(config.strategy)}
}

module.exports = new StrategyFactory();

