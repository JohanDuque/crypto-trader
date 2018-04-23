const config = require('./Configuration');

const strategies = new Map();
strategies.set('V1', require('../strategies/Strategy_V1'));
strategies.set('V2', require('../strategies/Strategy_V2'));
strategies.set('V3', require('../strategies/Strategy_V3'));
strategies.set('V4', require('../strategies/Strategy_V4'));
strategies.set('V5', require('../strategies/Strategy_V5'));
strategies.set('V6', require('../strategies/Strategy_V6'));
strategies.set('V7', require('../strategies/Strategy_V7'));
strategies.set('V8', require('../strategies/Strategy_V8'));
strategies.set('V9', require('../strategies/Strategy_V9'));
strategies.set('V10', require('../strategies/Strategy_V10'));
strategies.set('V11', require('../strategies/Strategy_V11'));
strategies.set('V12', require('../strategies/Strategy_V12'));
strategies.set('V13', require('../strategies/Strategy_V13'));
strategies.set('V14', require('../strategies/Strategy_V14'));
strategies.set('V15', require('../strategies/Strategy_V15'));
strategies.set('V16', require('../strategies/Strategy_V16'));

class StrategyFactory {
    getStrategy() {return strategies.get(config.strategy)}
}

module.exports = new StrategyFactory();

