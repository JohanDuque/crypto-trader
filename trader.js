console.log('-----------------');
console.log('V0.2');
const Account = require('./Account');
const Strategy = require('./Strategies/Strategy1');
let account = new Account({ startAmountToTrade: 25 });
let strategy = new Strategy({ account: account });
strategy.start();