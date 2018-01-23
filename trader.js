const Gdax = require('gdax');
const { pollingInterval, amountToTrade, investment,
  errorTolerance, productType, tradeSampleSize,
  orderFillError, verbose
} = require('./params');

const publicClient = new Gdax.PublicClient();
const sell = 'sell';
const buy = 'buy';
const fromCurrency=productType.split('-')[0];
const toCurrency=productType.split('-')[1];

const traderId=pollingInterval+"s|"
+amountToTrade +fromCurrency+"|"
+investment+toCurrency+"|"
+tradeSampleSize+"|"+orderFillError;


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
let lastOrderWasFilled = true;
let fills=0;

let doSell=(price) =>{
  sellTimes++;
  lastSellPrice=price;
  lastAction=sell;
  profits += calculateTransactionAmount(price);

  verbose ? console.log("\n +++++++ Selling at: "+price +"("+toCurrency+") +++++++ Sell Times: "+sellTimes) : printReport();
};

let doBuy=(price) =>{
  buyTimes++;
  lastBuyPrice=price;
  lastAction=buy;
  profits -= calculateTransactionAmount(price);

  verbose ? console.log("\n ------- Buying at: "+price+"("+toCurrency+") ------- Buy Times: "+buyTimes) : printReport();
};

let getAverage=(items) =>{
	var sumItems = items.reduce((accumulator, item) => {
                //"item": [ price, size, num-orders ] 
                return accumulator + parseInt(item[0]);
              }, 0);
	return sumItems/items.length;
};

let calculateTransactionAmount=(price) => {
  return price * amountToTrade;
};

let getOrderBook =()=> {
  publicClient.getProductOrderBook(productType, { level: 2 })
  .then(data => {
    if(verbose){
      console.log("Order Book:");
      console.log(data);
      console.log("\n");
    }

    bidsAverage = getAverage(data.bids);
    asksAverage = getAverage(data.asks);

    if(!verbose){
      console.log("Bids Average: " +bidsAverage +'');
      console.log("Asks Average: " +asksAverage +'');      
    }
  })
  .catch(error => {
      //TODO handle error
      errors++;
      if(verbose)console.log(error);
    });
};


let getProductTicker =()=>{
  publicClient.getProductTicker(productType)
  .then(data => {
    //console.log(data);
    currentMarketPrice = Number(data.price);
  })
  .catch(error => {
    //TODO handle error
    errors++;
    if(verbose)console.log(error);
  });
};

let getTradeHistory =()=>{
  publicClient.getProductTrades(productType, {limit:tradeSampleSize})
  .then(data => {
    if(verbose){
      console.log("Trade History:");
      console.log(data);
      console.log("\n");
    }

    checkFills(data);
    buys = data.filter(data => data.side === buy).length;
    sells = data.filter(data => data.side === sell).length;

    if(!verbose){
      console.log('Current Buyers: ' + buys);
      console.log('Current Sellers: ' + sells);
    }
  })
  .catch(error => {
      //TODO handle error
      errors++;
      if(verbose)console.log(error);
    });  
};

let checkFills=(tradeHistory)=>{  
  let filteredArray;
    //Debugging
    // tradeHistory.forEach(function(element) {
    //   let isOrNot = Math.abs(lastBuyPrice - element.price) <= orderFillError;
    //   let test = Math.abs(lastBuyPrice - element.price);
    // console.log(element.price +" - "+test + " - " + isOrNot);
    // });

    if(!lastOrderWasFilled){
      if(lastAction === buy){
        filteredArray = tradeHistory.filter((data) => {return Math.abs(lastBuyPrice - data.price) <= orderFillError});
      }else{
        filteredArray = tradeHistory.filter((data) => {return Math.abs(lastSellPrice - data.price) <= orderFillError});
      }

      lastOrderWasFilled = filteredArray.length > 0;
      
      if(lastOrderWasFilled){
       fills++;
       printReport();
     };
   }
 };

 let askForInfo = ()=>{
  getOrderBook();
  getProductTicker();
  getTradeHistory();
};


let makeAChoice_V1 = () =>{
  if(sells > buys && lastAction!==buy && lastSellPrice >= bidsAverage && lastOrderWasFilled){
    doBuy(bidsAverage);
    lastOrderWasFilled = false;
  }
  if(buys > sells && lastAction!==sell && asksAverage > lastBuyPrice && lastOrderWasFilled){
    doSell(asksAverage);
    lastOrderWasFilled = false;
  }
  if(iteration == 1){
    doBuy(bidsAverage);//I'm assuming first action will be to Buy, could be buggy!
  }
};

let makeAChoice = () =>{
  let betterAverage = currentMarketPrice;

  if(sells > buys && lastAction!==buy && lastSellPrice >= currentMarketPrice && lastOrderWasFilled){
    betterAverage = (bidsAverage + currentMarketPrice) / 2;
    console.log("Improved Average: "+betterAverage);

    doBuy(betterAverage);
    lastOrderWasFilled = false;
  }
  if(buys > sells && lastAction!==sell && lastBuyPrice < currentMarketPrice && lastOrderWasFilled){
    betterAverage = (asksAverage + currentMarketPrice) / 2;
    console.log("Improved Average: "+betterAverage);

    doSell(betterAverage);
    lastOrderWasFilled = false;
  }

  betterAverage = (bidsAverage + currentMarketPrice) / 2;
  console.log("Improved Buy Average: "+betterAverage);

  betterAverage = (asksAverage + currentMarketPrice) / 2;
  console.log("Improved Sell Average: "+betterAverage);

  if(iteration == 1){
    lastSellPrice = currentMarketPrice;//This is only to give a starting point
  }
  
};

//******************* MAIN ********************//
let doTrade=() => {
  iteration++;

  makeAChoice();
  askForInfo();

  if(!verbose) printReport();
};

let printReport= ()=>{
  console.log("\n--------------------------------------------------------------");
  console.log("  "+new Date()+"   "+"Iteration #"+iteration);
  console.log("  Trader# "+traderId+"            Errors: "+ errors);    
  console.log("  Last Buy Order : "+lastBuyPrice+"("+toCurrency+")        Buy Orders: "+ buyTimes); 
  console.log("  Last Sell Order: "+lastSellPrice+"("+toCurrency+")       Sell Orders: "+ sellTimes);
  console.log("  Profits        : "+profits+"("+toCurrency+")   Filled Orders: "+fills);
  console.log("  Current price  : "+ currentMarketPrice+"("+toCurrency+")");
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
