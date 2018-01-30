const config = require('./Configuration');

const Strategy_V1 = require('./strategies/Strategy_V1');
const Strategy_V2 = require('./strategies/Strategy_V2');
const Strategy_V3 = require('./strategies/Strategy_V3');
const Strategy_V4 = require('./strategies/Strategy_V4');
const Strategy_V5 = require('./strategies/Strategy_V5');
const Strategy_V6 = require('./strategies/Strategy_V6');
const Strategy_V7 = require('./strategies/Strategy_V7');

const strategies = new Map();
strategies.set('V1', Strategy_V1);
strategies.set('V2', Strategy_V2);
strategies.set('V3', Strategy_V3);
strategies.set('V4', Strategy_V4);
strategies.set('V5', Strategy_V5);
strategies.set('V6', Strategy_V6);
strategies.set('V7', Strategy_V7);

module.exports = class StrategyFactory {
	static getStrategy(){
		return strategies.get(config.strategy);
	}
};

