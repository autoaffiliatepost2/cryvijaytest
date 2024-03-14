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
const { RestClientV5 } = require('bybit-api');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

const client = new RestClientV5({
  testnet: false,
  key: config.byKey,
  secret: config.bySecret,
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

/** Order modify apis */
router.get('/setTradingStopApi', function (req, res) {
  async.waterfall([
    function (nextCall) {
      client.setTradingStop({
              category: 'linear',
              symbol: 'SLPUSDT',
              takeProfit: '0.006437',
              stopLoss: '0',
              tpTriggerBy: 'MarkPrice',
              // slTriggerBy: 'IndexPrice',
              tpslMode: 'Partial',
              tpOrderType: 'Limit',
              // slOrderType: 'Limit',
              tpSize: '10',
              // slSize: '50',
              tpLimitPrice: '0.006437',
              // slLimitPrice: '0.21',
              positionIdx: 0,
          })
          .then((response) => {
              console.log(response);
              nextCall(null, response);
          })
          .catch((error) => {
              console.error(error);
              return nextCall({
                "message": "something went wrong",
                "data": null
              });
          });
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
      message: "Order modify apis successfully",
      data: response
    });
  });
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
    await teleStockMsg("---> Binance api balance featch failed");
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
      console.log('err: ', err);
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
    await teleStockMsg("Bybit api balance featch successfully");
    res.send({
      status_api: 200,
      message: 'Bybit balance fetch successfully',
      data: binanceBalance,
    });
  } catch (err) {
    await teleStockMsg("---> Bybit api balance featch failed");
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
    await teleStockMsg("---> Bybit api token data featch failed");
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
    let finalDateTime =  moment.tz('Asia/Kolkata').format('DD-MM-YYYY HH:mm ss:SSS');
    let openOrderQty;
    let openOrdersData = req.query?.accountType === 'spot' ?  await bybitClient.fetchPosition(req.query?.instrument_token) : await bybitClient1.fetchPosition(req.query?.instrument_token);
    let positionDirection = openOrdersData.info.side;
    if(req.query?.position_size && (Number(req.query?.position_size) != 0)){
      openOrderQty = Number(req.query?.position_size) + Number(openOrdersData.contracts);
    }else{
      openOrderQty = Number(req.query?.quantity);
    }
   if(positionDirection.toLowerCase() != req.query?.transaction_type){
    const bybitBalance = await async.waterfall([
      async function () {
        let symbol = req.query?.instrument_token;
        let type = req.query?.order_type; // or 'MARKET' or 'LIMIT'
        let side = req.query?.transaction_type; // or 'SELL' or 'BUY'
        let price = Number(req.query?.price); 
        let quantity = Number(openOrderQty); 

        // Fetch OHLCV (Open/High/Low/Close/Volume) data
        let order;
        if(req.query?.sl_price && (Number(req.query?.sl_price) != 0)){
          let params = {
            'stopLoss': {
              'type': 'limit', // or 'market', this field is not necessary if limit price is specified
              'triggerPrice': req.query?.sl_price,
            },
            marginMode: req.query?.margin_mode
            // marginMode: req.query?.margin_mode =='isolated' ? 'isolated' :'cross'
          };
          order =  req.query?.accountType === 'spot' ? await bybitClient.createOrder(symbol, type, side, quantity, price, params) : await bybitClient1.createOrder(symbol, type, side, quantity, price, params);
        }else{
          let params = {
            marginMode: req.query?.margin_mode,
            tpslMode:'partial'
          };
          order =  req.query?.accountType === 'spot' ? await bybitClient.createOrder(symbol, type, side, quantity, price, params) : await bybitClient1.createOrder(symbol, type, side, quantity, price, params);
          // order =  req.query?.accountType === 'spot' ? await bybitClient.createOrder(symbol, type, side, quantity, price) : await bybitClient1.createOrder(symbol, type, side, quantity, price);
        }
        
        if(req.query?.tp_price && req.query?.tp_qty){
          let openOrderGet= req.query?.accountType === 'spot' ?  await bybitClient.fetchPosition(req.query?.instrument_token) : await bybitClient1.fetchPosition(req.query?.instrument_token);
          console.log('openOrderGet: ', openOrderGet);
          let entryPrice = Number(openOrderGet.entryPrice);
          const array1 = req.query?.tp_price.split(',');
          const array2 = req.query?.tp_qty.split(',');
          const array3 = req.query?.tp_sl.split(',');
          let finalSymbol = req.query?.instrument_token.replace("/USDT:USDT", 'USDT');

          // const resultArray = array1.slice(0, Math.min(array1.length, array2.length, array3.length)).map((price, index) => {
          //   const qty = array2[index];
          //   const sl = array3[index];
          //   return { qty, price, sl };
          // });
          const resultArray = array1.slice(0, Math.min(array1.length, array2.length, array3.length)).map((_, index) => {
            const price = side=='buy' ? calculateBuyTPSL(entryPrice,array1[index]) :  calculateSellTPSL(entryPrice,array1[index]);
            const qty = array2[index]
            const sl = side=='buy' ?  calculateBuyTPSL(entryPrice,array3[index]) :  calculateSellTPSL(entryPrice,array3[index]);
            return { qty, price, sl };
          });
          await Promise.all(resultArray.map(item => setTradingStop(item,finalSymbol)))
            .then((responses) => {
              console.log('responses: ', responses);
              console.log('order: ', order);
               return order;
            })
            .catch((error) => {
              return nextCall({
                "message": "something went wrong",
                "data": null
              });
            })
            let html = '<b>Account Id : </b> Jigar <b>[Bybit]</b> \n\n' +
            '🔀 <b>Direction : </b> <b> ' + req.query.transaction_type + '</b>'+(req.query.transaction_type == 'buy'? '🟢' : '🔴')+'\n' +
            '🌐 <b>Script : </b> ' + req.query.instrument_token + '\n' +
            '💰 <b>Price : ₹</b> ' + req.query.price + '\n' +
            '🚫 <b>Qty : </b> ' + openOrderQty + '\n' +
            '📈 <b>Mode : </b> ' + req.query.order_type + '\n' +
            '🕙 <b>Trade Time : </b> ' + finalDateTime + '\n' ;
            
            for (let i = 0; i < resultArray.length; i++) {
              const entry = resultArray[i];
              const tpNumber = i + 1;  // TP1, TP2, TP3, etc.
              let bookIcon = '';
              if (tpNumber == 1) {
                  bookIcon = '📕'; 
              }else if (tpNumber == 2) {
                  bookIcon = '📒';  
              } else {
                  bookIcon = '📗';  // Use a different icon for sl <= 0.005
              }
              html += `${bookIcon} <b> TP${tpNumber} EntryPrice: </b> ${Number(entry.price).toFixed(6)}\n` +
                      `${bookIcon} <b> TP${tpNumber} qty: </b> ${entry.qty}\n` +
                      `${bookIcon} <b> TP${tpNumber} sl: </b> ${Number(entry.sl).toFixed(6)}\n`;
            }
            await teleAnotherStockMsg(html);
        }else{
          return order;
        }
      },
    ]);
    await teleStockMsg("Bybit api buy/sell api featch successfully");
    res.send({
      status_api: 200,
      message: 'Bybit api buy/sell api featch successfully',
      data: bybitBalance,
    });
  }else{
    await teleStockMsg("Bybit api buy/sell api fire but not order");
    res.send({
      status_api: 200,
      message: 'Bybit api buy/sell api fire but not order',
      data: '',
    });
  }
  } catch (err) {
    await teleStockMsg("---> Bybit api buy/sell api featch failed");
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

async function setTradingStop(item,symbol) {
  return client.setTradingStop({
    category: 'linear',
    symbol: symbol,
    takeProfit: Number(item.price).toFixed(6),
    stopLoss: Number(item.sl).toFixed(6),
    tpTriggerBy: 'MarkPrice',
    slTriggerBy: 'MarkPrice',
    tpslMode: 'Partial',
    tpOrderType: 'Limit',
    slOrderType: 'Limit',
    tpSize: item.qty,
    slSize: item.qty,
    tpLimitPrice: Number(item.price).toFixed(6),
    slLimitPrice: Number(item.sl).toFixed(6),
    positionIdx: 0,
  });
}

function calculateBuyTPSL(entryPrice, Percentage) {
  const getPrice = Number(entryPrice) + (Number(entryPrice) * Number(Percentage) / 100);
  return getPrice;
}

function calculateSellTPSL(entryPrice, Percentage) {
  const getPrice = Number(entryPrice) - (Number(entryPrice) * Number(Percentage) / 100);
  return getPrice;
}

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
    await teleStockMsg("---> Bybit singal token price featch failed");
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
    await teleStockMsg("---> Bybit singal token cancel order failed");
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
    await teleStockMsg("---> Bybit token cancel all order failed");
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
    await teleStockMsg("---> Bybit token all open order failed");
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
        const symbol = req.query?.instrument_token;

        const openOrders = req.query?.accountType === 'spot' ?  await bybitClient.fetchPosition(symbol) : await bybitClient1.fetchPosition(symbol);

        if (openOrders.length === 0) {
          return 'No open orders postion.';
        }

       return openOrders;
      },
    ]);
    res.send({
      status_api: 200,
      message: 'Bybit token single open order position successfully',
      data: bybitBalance,
    });
  } catch (err) {
    await teleStockMsg("---> Bybit token single open order position failed");
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

/** bybit  single open order postition data */
router.get('/allOrderHistory123', async function (req, res) {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const bybitBalance = await async.waterfall([
      async function () {
        const symbol = req.query?.instrument_token;

        const openOrders = req.query?.accountType === 'spot' ?  await bybitClient.fetchTrades(symbol) : await bybitClient1.fetchTrades(symbol);

        if (openOrders.length === 0) {
          return 'No open orders postion.';
        }

       return openOrders;
      },
    ]);
    res.send({
      status_api: 200,
      message: 'Bybit token single open order position successfully',
      data: bybitBalance,
    });
  } catch (err) {
    await teleStockMsg("---> Bybit token single open order position failed");
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
    await teleStockMsg("---> Bybit token all open order position failed");
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
        const setLeverageData =  await bybitClient1.setLeverage(Number(req.query?.leverage),req.query?.instrument_token,{"marginMode": req.query?.margin_mode})

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
    await teleStockMsg("---> Bybit token setLeverage  failed");
    res.send({
      status_api: err.code ? err.code : 400,
      message: (err && err.message) || 'Something went wrong',
      data: err.data ? err.data : null,
    });
  }
});

router.get('/allOrderHistory', async (req, res) => {
  try {
    req.query?.accountType === 'spot' ? await bybitClient.load_time_difference() : await bybitClient1.load_time_difference();
    const response = await client.getClosedPnL({
        category: 'linear',
        symbol: req.query?.instrument_token,
        limit:100,
        startTime:moment(req.query?.date).valueOf(),
        endTime:moment(req.query?.date).endOf('day').valueOf()
    });

    const allData = await getNextTrend(req, response.result.list, response.result.nextPageCursor);

    return res.send({
      status_api: 200,
      message: 'Order history data fetch successfully',
      data: allData,
    });
  } catch (error) {
    console.error(error);

    return res.send({
      status_api: error.code ? error.code : 400,
      message: (error && error.message) || 'Something went wrong',
      data: error.data ? error.data : null,
    });
  }
});

async function getNextTrend(req, data, cursor) {
  try {
    let allData = [...data];

    if (cursor) {
      const response = await client.getClosedPnL({
        category: 'linear',
        symbol: req.query?.instrument_token,
        cursor:cursor,
        limit: 100,
        startTime: moment(req.query?.date).valueOf(),
        endTime: moment(req.query?.date).endOf('day').valueOf(),
      });

      allData = allData.concat(response.result.list);

      if (response.result.list > 0 && response.result.nextPageCursor) {
        return await getNextTrend(req, allData, response.result.nextPageCursor);
      }
    }

    return allData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/** bybit symbol data */
router.get('/symbolData', async function (req, res) {
  try {
    await bybitClient1.load_time_difference();
    // Get market symbols and quantities
    const symbolsAndQuantities =  await bybitClient1.loadMarkets();

    res.send({
      status_api: 200,
      message: 'Bybit token single open order position successfully',
      data: symbolsAndQuantities,
    });
  } catch (err) {
    await teleStockMsg("---> Bybit token single open order position failed");
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

function teleAnotherStockMsg(msg) {
  bot = new nodeTelegramBotApi(config.token);
  bot.sendMessage(config.channelId2, "→ "+msg, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  })
}

module.exports = router;
