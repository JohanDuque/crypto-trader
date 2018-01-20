const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
const SELL = 'sell';
const BUY = 'buy';
const AMOUNT_TO_TRADE= 1;//0.01;//ETH

let iteration = 0;
let profits = 1000;
let buyAverage=0;
let lastBuyPrice=0;
let sellAverage=0;
let lastSellPrice=0;
let currentPrice=0;
let buys, sells =0;
let nIntervId;
let lastAction = SELL;
let buyTimes=0;
let sellTimes=0;

let buy=(price) =>{
  buyTimes++;
  lastBuyPrice=price;
  lastAction=BUY;
  profits -= calculateTransactionAmount(price);
  console.log("\n------- -------  Buying at: "+price +"  -------  Buy Times: "+buyTimes);
};

let sell=(price) =>{
  sellTimes++;
  lastSellPrice=price;
  lastAction=SELL;
  profits += calculateTransactionAmount(price);
  console.log("\n+++++++ +++++++  Selling at: "+price +"  +++++++  Sell Times: "+sellTimes);
};

let getAverage = (bids) =>{
	var sumBids = bids.reduce((accumulator, bid) => {
    return accumulator + parseInt(bid[0]);
  }, 0);

	return sumBids/bids.length;
};

let calculateTransactionAmount = (price) => {return price * AMOUNT_TO_TRADE};

let askForInfo = ()=>{
  publicClient.getProductOrderBook('ETH-EUR', { level: 2 })
  .then(data => {
    //console.log("...............// Get the order book at the default level of detail.");
    //console.log(data);
    buyAverage = getAverage(data.bids);
    console.log("Buy Average: " +buyAverage +'');
    sellAverage = getAverage(data.asks);
    console.log("Sell Average: " +sellAverage +'');
  })
  .catch(error => {
    console.error(".... handle the error");
    console.log(error);
  });

  publicClient.getProductTicker('ETH-EUR')
  .then(data => {
    //console.log("// publicClient.getProductTicker('ETH-EUR'");
    //console.log(data);
    currentPrice = data.price;
    console.log("Current Price: " + currentPrice);
  })
  .catch(error => {
    console.error(".... handle the error");
    console.log(error);
  });

  publicClient.getProductTrades('ETH-EUR', {limit:10})
  .then(data => {
    //console.log("// To make paginated requests, include page parameters");
    //console.log(data);
    buys = data.filter(data => data.side === BUY).length;
    console.log('buys: ' + buys);
    sells = data.filter(data => data.side === SELL).length;
    console.log('sells: ' + sells);
  })
  .catch(error => {
    console.error(".... handle the error");
    console.log(error);
  });  

  //gdaxTime();
}

let gdaxTime = () =>{
  publicClient.getTime()
  .then(data => {
    console.log("getTime()");
    console.log(data);
  })
  .catch(error => {
    console.error(".... handle the error");
    console.log(error);
  });
}

let makeChoice = () =>{
  if(iteration == 1){
     buy(buyAverage); // I assuming first action will be to Buy
   }

   if(sells > buys && lastAction!==BUY && lastSellPrice >= buyAverage){
    buy(buyAverage);
  }
  if(buys > sells && lastAction!==SELL && sellAverage > lastBuyPrice){
    sell(sellAverage);
  }
}

let doTrade=() => {
  iteration++;

  makeChoice();

  askForInfo(); 

  console.log("\n    " + new Date() + " - " + " Iteration #" + iteration);
  console.log("\nTrader Profits: " +  profits);
  console.log("Last Buy Price: " +  lastBuyPrice);
  console.log("Last Sell Price: " +  lastSellPrice);
  console.log("");

  if(profits <= 0){
    console.log("\n   !!!!!!!!  SORRY MAN, YOUR BANKRUPT.  !!!!!!!!\n");
    clearInterval(nIntervId);
  }
};


askForInfo();
nIntervId = setInterval(doTrade, 10000);









