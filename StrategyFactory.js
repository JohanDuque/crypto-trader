const Configuration = require('./Configuration');

const Strategist_V1 = require('./strategies/Strategist_V1');
const Strategist_V2 = require('./strategies/Strategist_V2');
const Strategist_V3 = require('./strategies/Strategist_V3');

const config = new Configuration();

const strategies = new Map();
strategies.set('V1', new Strategist_V1());
strategies.set('V2', new Strategist_V2());
strategies.set('V3', new Strategist_V3());

//module.exports =
 class StrategyFactory {
	static getStrategy(){
		return strategies.get(config.strategy);
	}
};
 
const test = StrategyFactory.getStrategy();
console.log("test  "  + test.apply());
