'use strict';

// API includes
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var svc;

function initservice() {
    // Create a service object
    svc = LocalServiceRegistry.createService('whatsappAPIResp', {
        createRequest: function (service, args) {
            //service.addHeader('Authorization', 'Bearer');
            service.addHeader('Content-Type', 'application/json');
            return (args) ? JSON.stringify(args.data) : null;
        },
        parseResponse: function (service, client) {
            var result = {
                text: client.text,
                headers: client.getResponseHeaders() ? client.getResponseHeaders() : null
            }
            return client;
        },
        getRequestLogMessage: function (request) {
            return JSON.stringify(request);
        },
        getResponseLogMessage: function (response) {
            return response.text;
        },
    });
}

/*
function responseFilter(httpResponse) {
    if (httpResponse.status !== 'OK') {
        var errorResult = {
            statusCode: httpResponse.status,
            code: httpResponse.error,
            errorMessage: httpResponse.getErrorMessage(),
        };
        return errorResult;
    }

    // return a plain javascript object
    LOGGER.info(httpResponse);
    return httpResponse.object;
}
*/

function whatsappcall(from,msg_body) {
    initservice();
    svc.setRequestMethod('POST');
    svc.setURL('https://graph.facebook.com/v14.0/101009002799209/messages?access_token=EAARFZCFZBZBiCMBAP1tHHWFHZCkkNfpsqOFlEmmbXEqjZAgoWzMzvthvHPXb9HEns2EdxsmNuNWZAgWuUtsQ2gdftWnvEhVTWYl0A7OHiB6qqvJg5T0akyc9c3RtmZAZAqmc2vvlZBgrk5RCufx9JFTzVxjLBQMyL39qNkwXDdlL04klKrr5l3F3iGLtaL4ZBfPRElCSTZB49JBjjLQZC2azldYR');


    var data= {
        messaging_product: "whatsapp",
        to: from,
        text: { body: "Ack: " + msg_body },
      };

    return svc.call({ data: data });
    //return responseFilter(httpResult);
}

module.exports = {
    whatsappcall: whatsappcall
};