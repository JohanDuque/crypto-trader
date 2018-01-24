const Configuration = require('./Configuration');

const Strategy_V1 = require('./strategies/Strategy_V1');
const Strategy_V2 = require('./strategies/Strategy_V2');
const Strategy_V3 = require('./strategies/Strategy_V3');

const config = new Configuration();

const strategies = new Map();
strategies.set('V1', new Strategy_V1());
strategies.set('V2', new Strategy_V2());
strategies.set('V3', new Strategy_V3());

//module.exports =
 class StrategyFactory {
	static getStrategy(){
		return strategies.get(config.strategy);
	}
};
 
const test = StrategyFactory.getStrategy();
console.log("test  "  + test.apply());
