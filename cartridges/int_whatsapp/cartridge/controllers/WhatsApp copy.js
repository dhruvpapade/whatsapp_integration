'use strict';

var server = require('server');

/*
server.get('webhook', function (req, res, next) {

  const verify_token = 'meatyhamhock';

  // Parse params from the webhook verification request
  let mode = req.querystring["hub.mode"];
  let token = req.querystring["hub.verify_token"];
  let challenge = req.querystring["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      //  console.log("WEBHOOK_VERIFIED");
      // res.status(200).send(challenge);

     // res.print(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.setStatusCode(403);
      // res.print();
    }
  }

  next();
});

*/

server.post('webhook', function(req, res, next) {

    var Logger = require('dw/system/Logger');
    var whatsappHelper = require('~/cartridge/scripts/helpers/whatsAppHelper');

    //let body = JSON.parse(req);
    var resp;

    Logger.error('DhruveshappResponse {0}', req);

    if (body.object) {
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]) {

            var HelperResp = whatsappHelper.processWhatsAppCall(body);
        }
        res.setStatusCode(200);

    } else {
        res.setStatusCode(400);
        Logger.error('Dhruvesh {0}', 400);
    }

    //res.setStatusCode(200);
    res.json({
        status: 'OK',
    })

    next();
});

server.get('whatsappcall', function(req, res, next) {

    var whatsapp = require('~/cartridge/scripts/services/whatsAppServices');
    var resp = whatsapp.whatsappcall();

    res.json({
        resp: resp + '  '
    });

    next();
});

module.exports = server.exports();