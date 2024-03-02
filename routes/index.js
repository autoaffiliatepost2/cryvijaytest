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
router.get('/bybitTokenData', async function (req, res) {
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
          timestamp: data[0],
          open: data[1],
          high: data[2],
          low: data[3],
          close: data[4],
          volume: data[5],
        }));
        return formattedData;
      },
    ]);
    await teleStockMsg("Bybit api token data featch successfully");
    res.send({
      status_api: 200,
      message: 'Bybit api token data fetch successfully',
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
