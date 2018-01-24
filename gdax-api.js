const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();


publicClient.getProducts()
  .then(data => {
  	console.log("[GDAX API] Get Products");
    console.log(data);
  })
  .catch(error => {
    console.error("[GDAX API] .... handle the error");
    console.log(error);
  });

publicClient.getProductOrderBook('BTC-EUR', { level: 1 })
  .then(data => {
  	console.log("[GDAX API] // Get the order book at the default level of detail.");
    console.log(data);
  })
  .catch(error => {
    console.error("[GDAX API] .... handle the error");
    console.log(error);
  });

publicClient.getProductTicker('BTC-EUR')
  .then(data => {
  	console.log("[GDAX API] // publicClient.getProductTicker('ETH-USD'");
    console.log(data);
  })
  .catch(error => {
    console.error("[GDAX API] .... handle the error");
    console.log(error);
  });

// To make paginated requests, include page parameters
publicClient.getProductTrades('BTC-EUR', { after: 5 })
  .then(data => {
  	console.log("[GDAX API] // To make paginated requests, include page parameters");
    console.log(data);
  })
  .catch(error => {
    console.error("[GDAX API] .... handle the error");
    console.log(error);
  });

 publicClient.getProduct24HrStats('BTC-EUR')
  .then(data => {
  	console.log("[GDAX API] publicClient.getProduct24HrStats('BTC-EUR')");
    console.log(data);
  })
  .catch(error => {
    console.error("[GDAX API] .... handle the error");
    console.log(error);
  }); 

publicClient.getTime()
  .then(data => {
  	console.log("[GDAX API] getTime()");
    console.log(data);
  })
  .catch(error => {
    console.error("[GDAX API] .... handle the error");
    console.log(error);
  });