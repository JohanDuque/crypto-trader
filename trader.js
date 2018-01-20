const Gdax = require('gdax');
const { TRADE_INTERVAL_SECS,
        AMOUNT_TO_TRADE,
        INVESTMENT,
        ERROR_TOLERANCE,
        PRODUCT_TYPE,
        TRADE_SAMPLE_SIZE
      } = require('./params');

const publicClient = new Gdax.PublicClient();
const SELL = 'sell';
const BUY = 'buy';

const TRADER_ID=TRADE_INTERVAL_SECS+"s|"+AMOUNT_TO_TRADE +"eth|"+INVESTMENT+"eur";

let profits = INVESTMENT;
let iteration = 0;
let bidsAverage=0;
let lastBuyPrice=0;
let asksAverage=0;
let lastSellPrice=0;
let currentMarketPrice=0;
let buys=0;
let sells =0;
let nIntervId;
let lastAction = SELL;
let buyTimes=0;
let sellTimes=0;
let errors=0;

let buy=(price) =>{
  buyTimes++;
  lastBuyPrice=price;
  lastAction=BUY;
  profits -= calculateTransactionAmount(price);
  console.log("\n ------- Buying at: "+price +"(EUR) ------- Buy Times: "+buyTimes);
};

let sell=(price) =>{
  sellTimes++;
  lastSellPrice=price;
  lastAction=SELL;
  profits += calculateTransactionAmount(price);
  console.log("\n +++++++ Selling at: "+price +"(EUR) +++++++ Sell Times: "+sellTimes);
};

let getAverage = (items) =>{
	var sumItems = items.reduce((accumulator, item) => {
                //"item": [ price, size, num-orders ] 
    return accumulator + parseInt(item[0]);
  }, 0);

	return sumItems/items.length;
};

let getPreciseAverage = (items) =>{
  var size = items.reduce((accumulator, item) => {
                //"item": [ price, size, num-orders ] 
    return accumulator + parseInt(item[2]);
  }, 0);

  var sumItems = items.reduce((accumulator, item) => {
                //"item": [ price, size, num-orders ] 
    return accumulator + parseInt(item[0]);
  }, 0);

  return sumItems/size;
};

let calculateTransactionAmount = (price) => {return price * AMOUNT_TO_TRADE};

let askForInfo = ()=>{
  publicClient.getProductOrderBook(PRODUCT_TYPE, { level: 2 })
  .then(data => {
    //console.log("...............// Get the order book at the default level of detail.");
    //console.log(data);
    bidsAverage = getAverage(data.bids);
    console.log("Bids Average: " +bidsAverage +'');

    asksAverage = getAverage(data.asks);
    console.log("Asks Average: " +asksAverage +'');
  })
  .catch(error => {
    errors++;
    //TODO handle error
    console.log(error);
  });

  publicClient.getProductTicker(PRODUCT_TYPE)
  .then(data => {
    //console.log("// publicClient.getProductTicker(PRODUCT_TYPE");
    //console.log(data);
    currentMarketPrice = data.price;
  })
  .catch(error => {
    errors++;
    //TODO handle error
    console.log(error);
  });

  publicClient.getProductTrades(PRODUCT_TYPE, {limit:TRADE_SAMPLE_SIZE})
  .then(data => {
    //console.log("// To make paginated requests, include page parameters");
    //console.log(data);
    buys = data.filter(data => data.side === BUY).length;
    console.log('Buyers: ' + buys);
    sells = data.filter(data => data.side === SELL).length;
    console.log('Sellers: ' + sells);
  })
  .catch(error => {
    errors++;
    //TODO handle error
    console.log(error);
  });  

  //gdaxTime();
};

let gdaxTime = () =>{
  publicClient.getTime()
  .then(data => {
    console.log("getTime()");
    console.log(data);
  })
  .catch(error => {
    errors++;
    //TODO handle error
    console.log(error);
  });
};

let makeChoice = () =>{
  if(iteration == 1){
     buy(bidsAverage); // I assuming first action will be to Buy
   }
  if(sells > buys && lastAction!==BUY && lastSellPrice >= bidsAverage){
    buy(bidsAverage);
  }
  if(buys > sells && lastAction!==SELL && asksAverage > lastBuyPrice){
    sell(asksAverage);
  }
}

let doTrade=() => {
  iteration++;

  makeChoice();
  askForInfo(); 

  printReport();
};

let printReport= ()=>{
  console.log("\n" + new Date() + " - " + "Iteration #" + iteration);
  console.log("Trader_id: "+TRADER_ID+"  >>> Profits: " +  profits+" (EUR)");
  console.log("Buy Times: " + buyTimes);
  console.log("Sell Times: " + sellTimes);
  console.log("Current Price: " + currentMarketPrice);
  console.log("Last Buy Price: " +  lastBuyPrice);
  console.log("Last Sell Price: " +  lastSellPrice);
  console.log("Errors: " + errors);
  console.log("");

  if(profits <= 0){
    console.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
    clearInterval(nIntervId);
  }

  if(errors > ERROR_TOLERANCE){
    console.log("\n   !!!!!!!!  ERROR_TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
    clearInterval(nIntervId); 
  }
};

askForInfo();
nIntervId = setInterval(doTrade, TRADE_INTERVAL_SECS*1000);
