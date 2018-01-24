console.log('-----------------');
console.log('V0.2');
console.log('Strategy' + process.argv.slice(2)[0]);
const Events = require('events');
const ConfG = require('./Conf');
const ConfS = require('./Strategies/Strategy' + process.argv.slice(2)[0] +'/Conf');
const conf = Object.assign(ConfG, ConfS);

const Account = require('./Account');
const GdaxManager = require('./GdaxManager');
const OrderManager = require('./OrderManager');
const Reporting = require('./Reporting');
const Strategy = require('./Strategies/Strategy' + process.argv.slice(2)[0] + '/Strategy');


let params = {conf :conf};
let account = new Account(conf);


let eventManager = new Events();
params.eventManager = eventManager;

let gdaxManager = new GdaxManager(params);

params.account = account;
params.exchangeManager = gdaxManager;
let orderManager = new OrderManager(params);


let strategy = new Strategy(params);
params.orderManager = orderManager;
params.strategy = strategy;
let reporting = new Reporting(params);
strategy.start();