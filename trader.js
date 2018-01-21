const Gdax = require('gdax');
const { pollingInterval,
  amountToTrade,
  investment,
  errorTolerance,
  productType,
  tradeSampleSize,
  orderFillError,
  verbose
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
let wasLastOrderFilled = false;
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

let calculateTransactionAmount=(price) => {return price * amountToTrade};

let askForInfo = ()=>{
  publicClient.getProductOrderBook(productType, { level: 2 })
    .then(data => {
      //console.log(data);
      bidsAverage = getAverage(data.bids);
      asksAverage = getAverage(data.asks);
  
      if(verbose){
        console.log("Bids Average: " +bidsAverage +'');
        console.log("Asks Average: " +asksAverage +'');      
      }
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
      checkFills(data);
      buys = data.filter(data => data.side === buy).length;
      sells = data.filter(data => data.side === sell).length;
  
      if(verbose){
        console.log('Buyers: ' + buys);
        console.log('Sellers: ' + sells);
      }
    })
    .catch(error => {
      //TODO handle error
      errors++;
      console.log(error);
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

    if(!wasLastOrderFilled){
      if(lastAction === buy){
        filteredArray = tradeHistory.filter((data) => {return Math.abs(lastBuyPrice - data.price) <= orderFillError});
      }else{
        filteredArray = tradeHistory.filter((data) => {return Math.abs(lastSellPrice - data.price) <= orderFillError});
      }
  
      wasLastOrderFilled = filteredArray.length > 0;
      
      if(wasLastOrderFilled){
        fills++;
        printReport();
      };
    }
};

let makeAChoice = () =>{
  if(sells > buys && lastAction!==buy && lastSellPrice >= bidsAverage){
    doBuy(bidsAverage);
    wasLastOrderFilled = false;
  }
  if(buys > sells && lastAction!==sell && asksAverage > lastBuyPrice){
    doSell(asksAverage);
    wasLastOrderFilled = false;
  }
  if(iteration == 1){
    doBuy(bidsAverage);//I'm assuming first action will be to Buy, could be buggy!
  }
}


//******************* MAIN ********************//
let doTrade=() => {
  iteration++;

  makeAChoice();
  askForInfo();

  if(verbose) printReport();
};

let printReport= ()=>{
  console.log("\n--------------------------------------------------------------");
  console.log("  "+new Date()+"   "+"Iteration #"+iteration);
  console.log("  Trader# "+traderId+"                Errors: "+ errors);    
  console.log("  Last Buy     :  "+lastBuyPrice+"("+toCurrency+")                Buy Times: "+ buyTimes); 
  console.log("  Last Sell    :  "+lastSellPrice+"("+toCurrency+")               Sell Times: "+ sellTimes);
  console.log("  Profits      :  "+profits+"("+toCurrency+")            Fills: "+fills);
  console.log("  Current Price:  "+ currentMarketPrice+"("+toCurrency+")");
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
