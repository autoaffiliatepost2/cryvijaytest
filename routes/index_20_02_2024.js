var express = require('express');
var router = express.Router();
var async = require('async');
var nodeTelegramBotApi = require("node-telegram-bot-api");
let request = require("request");
var config = require('../config/global');
var connection = require('../config/connection');
const BitlyClient = require('bitly').BitlyClient;
const axios = require('axios');
var _ = require('underscore');
var moment = require('moment-timezone');
var qs = require('qs');
var config = require('../config/global');
// Import required modules
const ccxt = require ('ccxt');
const fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// const tick = async () => {
// const { asset, base, spred, allocation} = config;
// const market = '$(asset)/${base)';
// const orders = await binanceClient. fetchOpen0rders(market);
// orders. forEach(async order => {
// await binanceClient. cancel0rder(order.id);
// }) ;
// }
(async function () {
// const run = () => {
// const config = {
// asset: 'BTC',
// base:'USDT',
// allocation: 0.1,
// spread: 0.2,
// tickInterval: 2000
// };
// const binanceClient = new ccxt.binance({
//   apiKey: "bGSyeSb3FdIO3v4xxwadcfjKq598Hj6dOKXUsasasasSDquZi3VKvW3J07waiYq9Qtdw1IF",
//   secret: "BWHhLp94ZaVXZjUnqzuvtuHTJ1sasadw3xRLosxthDSzcVShv6JEh0rZAiGvYK3xYhqE",
//   enableRateLimit: true,
//   options: {
//     defaultType: 'future',
//     // defaultType: 'spot',
//   }
// });

/** Featch balance api */
router.get('/fetchBalance', function (req, res) {
  async.waterfall([
    function (nextCall) {
      var sqlss = " SELECT * FROM plateform_login";
      connection.query(sqlss,  async function (err, rides) {
        if (err) {
          return nextCall({
            "message": "something went wrong",
          });
        }
        let binanceBalance = req.query?.accountType == 'sport' ? ((await binanceClient.fetchBalance()).info) : ((await binanceClient1.fetchBalance()).info);
        nextCall(null, binanceBalance);
      })
    },
  ], function (err, response) {
    if (err) {
      return res.send({
        status_api: err.code ? err.code : 400,
        message: (err && err.message) || "someyhing went wrong",
        data: err.data ? err.data : null
      });
    }
    return res.send({
      status_api: 200,
      message: "Bianace balance featch successfully",
      data: response
    });
  });
});

 /*  -------------- featch all order Api---------------      */

// Fetch all open orders
// const openOrders = await binanceClient.fetchOpenOrders();
// //  const symbol = 'BTC/USDT';

//     // // Fetch open orders for the symbol
//     // const openOrders = await binanceClient.fetchOpenOrders(symbol);

// if (openOrders.length === 0) {
//   console.log('No open orders.');
//   return;
// }

// console.log('Open Orders:');
// openOrders.forEach(order => {
//   console.log(`Order ID: ${order.id}, Symbol: ${order.symbol}, Status: ${order.status}`);
// });

 /*  -------------- featch all order Api---------------      */



 /*  -------------- specific token order status Api---------------      */
// const symbol = 'BTC/USDT';
// const orderId = '1234567890'; // Replace with your order ID

// // Fetch order status
// const orderStatus = await binanceClient.fetchOrder(orderId, symbol);

// console.log('Order Status:', orderStatus);
 /*  -------------- specific token order status Api---------------      */


 /*  -------------- all token featch all order and cancel order Api---------------      */


 // Fetch all open orders
//  const openOrders = await binanceClient.fetchOpenOrders();

//  if (openOrders.length === 0) {
//    console.log('No open orders to cancel.');
//    return;
//  }

//  // Cancel all open orders
//  const canceledOrders = await Promise.all(
//    openOrders.map(async order => {
//      const canceledOrder = await binanceClient.cancelOrder(order.id, order.symbol);
//      console.log('Order canceled:', canceledOrder);
//      return canceledOrder;
//    })
//  );

//  console.log('All open orders canceled:', canceledOrders)
 /*  -------------- all token featch all order and cancel order Api---------------      */



 /*  -------------- singal token featch all order and cancel order Api---------------      */

    //  const symbol = 'BTC/USDT';

    // // Fetch open orders for the symbol
    // const openOrders = await binanceClient.fetchOpenOrders(symbol);

    // if (openOrders.length === 0) {
    //   console.log('No open orders to cancel.');
    //   return;
    // }

    // // Cancel all open orders
    // const canceledOrders = await Promise.all(
    //   openOrders.map(async order => {
    //     const canceledOrder = await binanceClient.cancelOrder(order.id, symbol);
    //     console.log('Order canceled:', canceledOrder);
    //     return canceledOrder;
    //   })
    // );

    // console.log('All open orders canceled:', canceledOrders);

 /*  -------------- singal token featch all order and cancel order Api ---------------      */

 /*  -------------- singal token  cancel order Api---------------      */

// const symbol = 'BTC/USDT';
// const side = 'BUY';
// const type = 'LIMIT';
// const price = 40000;
// const quantity = 0.001;

// // Place a new order
// const order = await binanceClient.createOrder(symbol, type, side, quantity, price);

// console.log('Order placed:', order);

// // Extract orderId from the response
// const orderId = order.id;

// // Wait for a moment (you might want to do other things here)

// // Cancel the order
// const canceledOrder = await binanceClient.cancelOrder(orderId, symbol);

// console.log('Order canceled:', canceledOrder);

 /*  -------------- singal token  current price Api---------------      */



 /*  -------------- singal token  current price Api---------------      */
// const symbol = 'AXL/USDT';

// // Fetch ticker data for the symbol
// const ticker = await binanceClient.fetchTicker(symbol);

// // Extract the current price from the ticker data
// const currentPrice = ticker.last;

// console.log(`Current price of ${symbol}: ${currentPrice} USDT`);

 /*  -------------- singal token  current price Api---------------      */

 /*  -------------- 1 min data Api---------------      */
//  const symbol = 'BTC/USDT';
//  const timeframe = '1s'; // 1-second interval
//  const limit = 60; // Fetch data for the last 60 seconds

//  // Fetch OHLCV (Open/High/Low/Close/Volume) data
//  const ohlcv = await binanceClient.fetchOHLCV(symbol, timeframe, undefined, limit);

//  // Map the response to human-readable format
//  const formattedData = ohlcv.map(data => ({
//    timestamp: new Date(data[0]),
//    open: data[1],
//    high: data[2],
//    low: data[3],
//    close: data[4],
//    volume: data[5],
//  }));

//  // Save the data to a JSON file
//  const fileName = 'binance_spot_btc_usdt_1sec_prices.json';
//  fs.writeFileSync(fileName, JSON.stringify(formattedData, null, 2));

//  console.log(`1-second prices for the last minute saved to ${fileName}`);
//  console.log(formattedData);
 /*  -------------- 1 min data Api---------------      */


 /*  -------------- 24 hours data Api---------------      */
// const symbol = 'BTC/USDT';
//     const timeframe = '1m'; // 1-minute interval
//     const limit = 1440; // 24 hours (1 minute * 1440 minutes)

//     // Fetch OHLCV (Open/High/Low/Close/Volume) data
//     const ohlcv = await binanceClient.fetchOHLCV(symbol, timeframe, undefined, limit);

//     // Map the response to human-readable format
//     const formattedData = ohlcv.map(data => ({
//       timestamp: new Date(data[0]),
//       open: data[1],
//       high: data[2],
//       low: data[3],
//       close: data[4],
//       volume: data[5],
//     }));

//     // Save the data to a JSON file
//     const fileName = 'binance_feature_btc_usdt_24h_prices.json';
//     fs.writeFileSync(fileName, JSON.stringify(formattedData, null, 2));

//     console.log(`24-hour prices saved to ${fileName}`);
//     console.log(formattedData);

 /*  -------------- 24 hours data Api---------------      */




    /*  -------------- 30 days data Api---------------      */

// const symbol = 'BTC/USDT';
//     const timeframe = '1d'; // 1 day interval
//     const limit = 30; // 30 days

//     // Fetch OHLCV (Open/High/Low/Close/Volume) data
//     const ohlcv = await binanceClient.fetchOHLCV(symbol, timeframe, undefined, limit);

//     // Map the response to human-readable format
//     const formattedData = ohlcv.map(data => ({
//       timestamp: new Date(data[0]),
//       open: data[1],
//       high: data[2],
//       low: data[3],
//       close: data[4],
//       volume: data[5],
//     }));

//     // Save the data to a JSON file
//     const fileName = 'binance_spot_btc_usdt_30_days.json';
//     fs.writeFileSync(fileName, JSON.stringify(formattedData, null, 2));

//     console.log(`Historical prices saved to ${fileName}`);
//     console.log(formattedData);
 /*  -------------- 30 days data Api---------------      */



/*  -------------- Buy/SEll Api---------------      */
// Define the trading pair and order parameters for futures.
// const symbol = 'BTC/USDT'; // Example trading pair for futures
// const type = 'LIMIT'; // or 'MARKET'
// const side = 'BUY'; // or 'SELL'
// const price = 40000; // Example price for limit orders
// const quantity = 0.001; // Example quantity

// Create an order for futures

// const order = await binanceFutures.createOrder(symbol, type, side, quantity, price);
// console.log('Order created:', order);

// or
// const symbol = 'BTC/USDT';

//     // Place a market order
//     const marketOrder = await binance.createMarketBuyOrder(symbol, 0.001); // Buy 0.001 BTC at the market price
//     console.log('Market Order:', marketOrder);

//     // Place a limit order
//     const limitOrder = await binance.createLimitSellOrder(symbol, 0.001, 50000); // Sell 0.001 BTC at $50,000 per BTC
//     console.log('Limit Order:', limitOrder);

/*  -------------- Buy/SEll Api---------------      */

// const ticker = await binanceClient.fetchTicker('BTC/USDT');
// console.log ("binanceClient", (await binanceClient.fetchBalance()).info)


// const bybitClient = new ccxt.bybit({
//   apiKey: "NY1beO22gCmzJHJ121LGS",
//   secret: "HeKdJ16t6s6FbPxId2121gEnowSpTPArMUlxBBRM"
// });

/*  -------------- Buy/SEll Api---------------      */


// Function to place a limit order
// async function placeLimitOrder(side, price, quantity) {
//   const order = await bybit.createOrder(symbol, 'limit', side, quantity, price);
//   console.log('Limit Order placed:', order);
// }

// // Function to place a market order
// async function placeMarketOrder(side, quantity) {
//   const order = await bybit.createOrder(symbol, 'market', side, quantity);
//   console.log('Market Order placed:', order);
// }

// // Function to place a BTILZ order
// async function placeBTILZOrder(side, quantity, price, icebergQty) {
//   const params = {
//     iceberg: icebergQty,
//   };

//   const order = await bybit.createOrder(symbol, 'limit', side, quantity, price, params);
//   console.log('BTILZ Order placed:', order);
// }

// // Example usage
// async function main() {
//   try {
//     // Place a limit order
//     await placeLimitOrder('buy', 50000, 0.001);

//     // Place a market order
//     await placeMarketOrder('sell', 0.002);

//     // Place a BTILZ order
//     await placeBTILZOrder('buy', 0.003, 49000, 0.001);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }
/*  -------------- Buy/SEll Api---------------      */

// Function to get the current price
async function getCurrentPrice(symbol) {
  const ticker = await bybit.fetchTicker(symbol);
  return ticker;
}

 /*  -------------- 24 hours data Api---------------      */
// Function to get historical price data for the last 24 hours

//     const symbol = 'BTC/USDT'; // Change to the desired trading pair
//     const outputFile = 'historical_prices3.json';
    
// async function get24hHistoricalPrices(symbol, timeframe = '1m') {
//   const since = bybitClient.milliseconds() - 24 * 60 * 60 * 1000; // 24 hours ago
//   const ohlcv = await bybitClient.fetchOHLCV(symbol, timeframe, since);
//   return ohlcv;
// }

// // Function to save data as JSON
// function saveAsJSON(data, filename) {
//   fs.writeFileSync(filename, JSON.stringify(data, null, 2));
//   console.log(`Data saved as ${filename}`);
// }

// // Example usage
// async function main() {
//   try {
//     // Get historical prices for the last 24 hours
//     const historicalPrices = await get24hHistoricalPrices(symbol, '1m');

//     // Save the data as JSON
//     saveAsJSON(historicalPrices, outputFile);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// main();

 /*  -------------- 24 hours data Api---------------      */

    /*  -------------- 30 days data Api---------------      */

//     const bybit = new ccxt.bybit({
//       apiKey,
//       secret: secretKey,
//       enableRateLimit: true,
//       options: {
//         defaultType: 'spot',
//       },
//     });
//     const symbol = 'BTC/USDT'; // Change to the desired trading pair
//     const outputFile = 'historical_prices.json';
    
// // Function to get historical price data
// async function getHistoricalPrices(symbol, timeframe = '1d', limit = 30) {
//   const ohlcv = await bybitClient.fetchOHLCV(symbol, timeframe, undefined, limit);
//   return ohlcv;
// }

// // Function to save data as JSON
// function saveAsJSON(data, filename) {
//   fs.writeFileSync(filename, JSON.stringify(data, null, 2));
//   console.log(`Data saved as ${filename}`);
// }

// // Example usage
// async function main() {
//   try {
//     // Get historical prices for the last 30 days
//     const historicalPrices = await getHistoricalPrices(symbol, '1d', 30);

//     // Save the data as JSON
//     saveAsJSON(historicalPrices, outputFile);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }


// main();

    /*  -------------- 30 days data Api---------------      */

// console.log(ticker);
// console.log (await ccxt.exchanges) // print all available exchanges

// console.log ("binanceClient.id", await bybitClient.fetchBalance())
// console.log ("huobipro.id",  await bybitClient.loadMarkets())



}) ();
module.exports = router;
