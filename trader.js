const Gdax = require('gdax');
const { pollingInterval,
  amountToTrade,
  investment,
  errorTolerance,
  productType,
  tradeSampleSize
} = require('./params');

const publicClient = new Gdax.PublicClient();
const sell = 'sell';
const buy = 'buy';
const fromCurrency=productType.split('-')[0];
const toCurrency=productType.split('-')[1];

const traderId=pollingInterval+"s|"
+amountToTrade +fromCurrency+"|"
+investment+toCurrency+"|"
+tradeSampleSize;

let profits = investment;
let iteration = 0;
let bidsAverage=0;
let lastBuyPrice=0;
let asksAverage=0;
let lastSellPrice=0;
let currentMarketPrice=0;
let buys=0;
let sells =0;
let nIntervId;
let lastAction = sell;
let buyTimes=0;
let sellTimes=0;
let errors=0;

let doSell=(price) =>{
  sellTimes++;
  lastSellPrice=price;
  lastAction=sell;
  profits += calculateTransactionAmount(price);
  console.log("\n +++++++ Selling at: "+price +"("+toCurrency+") +++++++ Sell Times: "+sellTimes);
};

let doBuy=(price) =>{
  buyTimes++;
  lastBuyPrice=price;
  lastAction=buy;
  profits -= calculateTransactionAmount(price);
  console.log("\n ------- Buying at: "+price+"("+toCurrency+") ------- Buy Times: "+buyTimes);
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

let calculateTransactionAmount = (price) => {return price * amountToTrade};

let askForInfo = ()=>{

  publicClient.getProductOrderBook(productType, { level: 2 })
  .then(data => {
    //console.log(data);
    bidsAverage = getAverage(data.bids);
    asksAverage = getAverage(data.asks);
    console.log("Bids Average: " +bidsAverage +'');
    console.log("Asks Average: " +asksAverage +'');
  })
  .catch(error => {
    //TODO handle error
    errors++;
    console.log(error);
  });


  publicClient.getProductTicker(productType)
  .then(data => {
    //console.log(data);
    currentMarketPrice = data.price;
  })
  .catch(error => {
    //TODO handle error
    errors++;
    console.log(error);
  });


  publicClient.getProductTrades(productType, {limit:tradeSampleSize})
  .then(data => {
    //console.log(data);
    buys = data.filter(data => data.side === buy).length;
    sells = data.filter(data => data.side === sell).length;
    console.log('Buyers: ' + buys);
    console.log('Sellers: ' + sells);
  })
  .catch(error => {
    //TODO handle error
    errors++;
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
    //TODO handle error
    errors++;
    console.log(error);
  });
};

let makeAChoice = () =>{
  if(iteration == 1){
     doBuy(bidsAverage); // I'm assuming first action will be to Buy
   }
   if(sells > buys && lastAction!==buy && lastSellPrice >= bidsAverage){
    doBuy(bidsAverage);
  }
  if(buys > sells && lastAction!==sell && asksAverage > lastBuyPrice){
    doSell(asksAverage);
  }
}

let doTrade=() => {
  iteration++;

  makeAChoice();
  askForInfo(); 

  printReport();
};

let printReport= ()=>{
  console.log("\n--------------------------------------------------------------");
  console.log("  "+new Date()+"   "+"Iteration #"+iteration);
  console.log("  Trader# "+traderId+"                Errors: "+ errors);    
  console.log("  Last Buy     :  "+lastBuyPrice+"("+toCurrency+")"+"                Buy Times: "+ buyTimes); 
  console.log("  Last Sell    :  "+lastSellPrice+"("+toCurrency+")"+"               Sell Times: "+ sellTimes);
  console.log("  Current Price:  "+ currentMarketPrice+"("+toCurrency+")");
  console.log("  Profits      :  "+profits+"("+toCurrency+")");
  console.log("-------------------------------------------------------------\n");

  if(profits <= 0){
    console.log("\n   !!!!!!!!  SORRY MAN, YOU'RE BANKRUPT.  !!!!!!!!\n");
    clearInterval(nIntervId);
  }

  if(errors > errorTolerance){
    console.log("\n   !!!!!!!!  ERROR TOLERANCE OUT OF LIMIT.  !!!!!!!!\n");
    clearInterval(nIntervId); 
  }
};

askForInfo();
nIntervId = setInterval(doTrade, pollingInterval*1000);
