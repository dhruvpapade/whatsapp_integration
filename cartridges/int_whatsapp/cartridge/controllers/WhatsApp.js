'use strict';

var server = require('server');
var Logger = require('dw/system/Logger');

server.use('webhook', function (req, res, next) {
  var method = req.httpMethod;

  if (method === 'GET') {
    const verify_token = 'meatyhamhock';
    let token = req.querystring["hub.verify_token"];
    let mode = req.querystring["hub.mode"];
    let challenge = req.querystring["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === verify_token) {
        res.setStatusCode(200);
        res.print(challenge);
        return next();
      }
    }
    res.setStatusCode(400);
    res.print('ERROR');

  } else if (method === 'POST') {
    var whatsappHelper = require('~/cartridge/scripts/helpers/whatsAppHelper'),
      payload = null,
      requestStored = false;
    try {
      payload = JSON.parse(req.body);
      if (payload.object && payload.entry[0].changes[0].value.messages) {
        Logger.info('whatsapp InboundHookRequest to SFCC: {0} ', req.body);
        var requestStored = whatsappHelper.processWhatsAppCall(payload);
      }
    } catch (e) {
      Logger.error('exception: {0} ', e);
    }

    if (requestStored === true) {
      okResponse(res);
      return next();
    }

    notOkResponse(res);
  }

  next();

});

function okResponse(res) {
  res.setStatusCode(200);
  res.json({
    success: true
  });
}

function notOkResponse(res) {
  res.setStatusCode(400);
  res.json({
    success: false
  });
}
module.exports = server.exports();