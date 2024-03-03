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
var config = require('../config/global');
// Import required modules
const ccxt = require ('ccxt');
const fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

const binanceClient = new ccxt.binance({
  apiKey: config.biKey,
  secret: config.biSecret,
  enableRateLimit: true,
  options: {
    'adjustForTimeDifference': true,
    defaultType: 'spot',
  }
});

const binanceClient1 = new ccxt.binance({
  apiKey: config.biKey,
  secret: config.biSecret,
  enableRateLimit: true,
  options: {
    'adjustForTimeDifference': true,
    defaultType: 'future',
  }
});

const bybitClient = new ccxt.bybit({
  apiKey: config.byKey,
  secret: config.bySecret,
  enableRateLimit: true,
  options: {
    'adjustForTimeDifference': true,
    defaultType: 'spot',
  }
});

const bybitClient1 = new ccxt.bybit({
  apiKey: config.byKey,
  secret: config.bySecret,
  enableRateLimit: true,
  options: {
    'adjustForTimeDifference': true,
    defaultType: 'future',
  }
});

/** binance Featch balance api */
router.get('/binanceFetchBalance', async function (req, res) {
  try {
    req.query?.accountType === 'spot'? await binanceClient.load_time_difference() : await binanceClient1.load_time_difference();
    const binanceBalance = await async.waterfall([
      async function () {
        return req.query?.accountType === 'spot'
          ? (await binanceClient.fetchBalance()).info
          : (await binanceClient1.fetchBalance()).info;
      },
    ]);
    await teleStockMsg("Binance api balance featch successfully");
    res.send({
      status_api: 200,
      message: 'Binance balance fetch successfully',
      data: binanceBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

setInterval(function setup() {
  let sqlsss = "SELECT * FROM app_data";
  connection.query(sqlsss, async function (err, appData) {
    console.log('appData: ', appData);
    if (err) {
      await logUser("App data fetch api failed");
    } else {
      testServer();
    }
  })
}, 19000)

function testServer(){   
  request({
    uri: "https://cryvijaytest.onrender.com/",
    method: "GET",
  }, (err, response, body) => {
    console.log('body: ', body);
  })
}

/** bybit Featch balance api */
router.get('/bybitFetchBalance', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const binanceBalance = await async.waterfall([
      async function () {
        return req.query?.accountType === 'spot'
          ? (await bybitClient.fetchBalance()).info
          : (await bybitClient1.fetchBalance()).info;
      },
    ]);
    await teleStockMsg("Binance api balance featch successfully");
    res.send({
      status_api: 200,
      message: 'Binance balance fetch successfully',
      data: binanceBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit api token data */
router.get('/historical-data', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.symbol;
        const timeframe = req.query?.timeframe; // 1 day interval
        const limit = Number(req.query?.limit); // 30 days

        // Fetch OHLCV (Open/High/Low/Close/Volume) data
        const ohlcv =  req.query?.accountType === 'spot' ? await bybitClient.fetchOHLCV(symbol, timeframe, undefined, limit) : await bybitClient1.fetchOHLCV(symbol, timeframe, undefined, limit);

        // Map the response to human-readable format
        const formattedData = ohlcv.map(data => ({
          date: data[0].toString(),
          open: data[1],
          high: data[2],
          low: data[3],
          close: data[4],
          vol: data[5],
          oi:0
        }));
        return formattedData;
      },
    ]);
    await teleStockMsg("Bybit api token data featch successfully");
    res.send({
      status_api: 200,
      message: 'Bybit api token data fetch successfully',
      data:{
       "status":"success", 
       "data":{
        "candles" :bybitBalance
       } 
      } ,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit buy/sell data */
router.get('/buySellApi', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    if(req.query?.leverage && Number(req.query?.leverage) != 0){
      await bybitClient1.setLeverage(Number(req.query?.leverage),req.query?.instrument_token,{"marginMode": req.query?.margin_mode})
    }
    const bybitBalance = await async.waterfall([
      async function () {
        let symbol = req.query?.instrument_token;
        let type = req.query?.order_type; // or 'MARKET' or 'LIMIT'
        let side = req.query?.transaction_type; // or 'SELL' or 'BUY'
        let price = Number(req.query?.price); 
        let quantity = Number(req.query?.quantity); 

        // Fetch OHLCV (Open/High/Low/Close/Volume) data
        let order;
        if(req.query?.trigger_price){
          let params = {
            stop_px: Number(req.query?.trigger_price),
            close_on_trigger: true,
            marginMode: req.query?.margin_mode
            // marginMode: req.query?.margin_mode =='isolated' ? 'isolated' :'cross'
          };
          order =  req.query?.accountType === 'spot' ? await bybitClient.createOrder(symbol, type, side, quantity, price, params) : await bybitClient1.createOrder(symbol, type, side, quantity, price, params);
        }else{
          let params = {
            marginMode: req.query?.margin_mode =='isolated' ? 'isolated' :'cross'
          };
          order =  req.query?.accountType === 'spot' ? await bybitClient.createOrder(symbol, type, side, quantity, price, params) : await bybitClient1.createOrder(symbol, type, side, quantity, price, params);
          // order =  req.query?.accountType === 'spot' ? await bybitClient.createOrder(symbol, type, side, quantity, price) : await bybitClient1.createOrder(symbol, type, side, quantity, price);
        }
        
        return order;
      },
    ]);
    await teleStockMsg("Bybit api buy/sell api featch successfully");
    res.send({
      status_api: 200,
      message: 'Bybit api buy/sell api featch successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit singal token price data */
router.get('/marketQuotesLTP', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.instrument_key;

        const order =  req.query?.accountType === 'spot' ? await bybitClient.fetchTicker(symbol) : await bybitClient1.fetchTicker(symbol);
        return order;
      },
    ]);
    await teleStockMsg("Bybit singal token price featch successfully");
    res.send({
      status_api: 200,
      message: 'Bybit singal token price featch successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit singal token Cancel oreder data */
router.get('/orderCancel', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.instrument_key;
        const openOrders = req.query?.accountType === 'spot' ? await bybitClient.fetchOpenOrders(symbol) : await bybitClient1.fetchOpenOrders(symbol);

        if (openOrders.length === 0) {
          return 'No open orders to cancel.';
        }

        // Cancel all open orders
        const canceledOrders = await Promise.all(
          openOrders.map(async order => {
            const canceledOrder = req.query?.accountType === 'spot' ?  await bybitClient.cancelOrder(order.id, symbol) : await bybitClient1.cancelOrder(order.id, symbol);
            return canceledOrder;
          })
        );
       return canceledOrders;
      },
    ]);
    await teleStockMsg("Bybit singal token cancel order successfully");
    res.send({
      status_api: 200,
      message: 'Bybit singal token cancel order successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit Cancel all order token data */
router.get('/cancelAllOrder', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {

        const openOrders = req.query?.accountType === 'spot' ?  await bybitClient.fetchOpenOrders() : await bybitClient1.fetchOpenOrders();

        if (openOrders.length === 0) {
          return 'No open orders to cancel.';
        }

        // Cancel all open orders
        const canceledOrders = await Promise.all(
          openOrders.map(async order => {
            const canceledOrder = req.query?.accountType === 'spot' ?  await bybitClient.cancelOrder(order.id, symbol) : await bybitClient1.cancelOrder(order.id, symbol);
            return canceledOrder;
          })
        );
       return canceledOrders;
      },
    ]);
    await teleStockMsg("Bybit token cancel all order successfully");
    res.send({
      status_api: 200,
      message: 'Bybit token cancel all order successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit  all open order token data */
router.get('/openAllOrder', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {

        const openOrders = req.query?.accountType === 'spot' ?  await bybitClient.fetchOpenOrders() : await bybitClient1.fetchOpenOrders();

        if (openOrders.length === 0) {
          return 'No any open orders.';
        }

       return openOrders;
      },
    ]);
    await teleStockMsg("Bybit token all open order successfully");
    res.send({
      status_api: 200,
      message: 'Bybit token all open order successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit  single open order postition data */
router.get('/openSingleOrderPostition', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.instrument_key;

        const openOrders = req.query?.accountType === 'spot' ?  await bybitClient.fetchPositions(symbol) : await bybitClient1.fetchPositions(symbol);

        if (openOrders.length === 0) {
          return 'No open orders postion.';
        }

       return openOrders;
      },
    ]);
    await teleStockMsg("Bybit token single open order position successfully");
    res.send({
      status_api: 200,
      message: 'Bybit token single open order position successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit  all open order postition data */
router.get('/openAllOrderPostition', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const openOrders = req.query?.accountType === 'spot' ?  await bybitClient.fetchPositions() : await bybitClient1.fetchPositions();

        if (openOrders.length === 0) {
          return 'No open orders postion.';
        }

       return openOrders;
      },
    ]);
    await teleStockMsg("Bybit token all open order position successfully");
    res.send({
      status_api: 200,
      message: 'Bybit token all open order position successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit  setLeverage order postition data */
router.get('/setLeverage', async function (req, res) {
  try {
    await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const setLeverageData =  await bybitClient1.setLeverage(1,'GMT/USDT:USDT',{"marginMode": "cross"});

       return setLeverageData;
      },
    ]);
    await teleStockMsg("Bybit token setLeverage  successfully");
    res.send({
      status_api: 200,
      message: 'Bybit token setLeverage successfully',
      data: bybitBalance,
    });
  } catch (err) {
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

function teleStockMsg(msg) {
  bot = new nodeTelegramBotApi(config.token);
  bot.sendMessage(config.channelId, "## "+msg, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  })
}

module.exports = router;