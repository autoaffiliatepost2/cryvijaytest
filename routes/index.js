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
    defaultType: 'spot',
  }
});

const binanceClient1 = new ccxt.binance({
  apiKey: config.biKey,
  secret: config.biSecret,
  enableRateLimit: true,
  options: {
    defaultType: 'future',
  }
});

const bybitClient = new ccxt.bybit({
  apiKey: "NY1beO22gCmzJHJLGS",
  secret: "HeKdJ16t6s6FbPxIdgEnowSpTPArMUlxBBRM",
  enableRateLimit: true,
  options: {
    defaultType: 'spot',
  }
});

const bybitClient1 = new ccxt.bybit({
  apiKey: "NY1beO22gCmzJHJLGS",
  secret: "HeKdJ16t6s6FbPxIdgEnowSpTPArMUlxBBRM",
  enableRateLimit: true,
  options: {
    defaultType: 'future',
  }
});

/** binance Featch balance api */
router.get('/binanceFetchBalance', async function (req, res) {
  try {
    const binanceBalance = await async.waterfall([
      async function () {
        return req.query?.accountType === 'sport'
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
    const binanceBalance = await async.waterfall([
      async function () {
        return req.query?.accountType === 'sport'
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
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.symbol;
        const timeframe = req.query?.timeframe; // 1 day interval
        const limit = Number(req.query?.limit); // 30 days

        // Fetch OHLCV (Open/High/Low/Close/Volume) data
        const ohlcv =  req.query?.accountType === 'sport' ? await bybitClient.fetchOHLCV(symbol, timeframe, undefined, limit) : await bybitClient1.fetchOHLCV(symbol, timeframe, undefined, limit);

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
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.symbol;
        const type = req.query?.type; 
        const side = req.query?.side; 
        const price = Number(req.query?.price); 
        const quantity = Number(req.query?.quantity); 

        // Fetch OHLCV (Open/High/Low/Close/Volume) data
        const order =  req.query?.accountType === 'sport' ? await bybitClient.createOrder(symbol, type, side, quantity, price) : await bybitClient1.createOrder(symbol, type, side, quantity, price);
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
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.symbol;

        const order =  req.query?.accountType === 'sport' ? await bybitClient.fetchTicker(symbol) : await bybitClient1.fetchTicker(symbol);
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

function teleStockMsg(msg) {
  bot = new nodeTelegramBotApi(config.token);
  bot.sendMessage(config.channelId, "## "+msg, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  })
}

module.exports = router;
