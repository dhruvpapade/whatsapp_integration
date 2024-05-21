'use strict';

// API includes
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var svc;

function initservice() {
    // Create a service object
    svc = LocalServiceRegistry.createService('whatsapp.api', {
        createRequest: function (service, args) {
            service.addHeader('Authorization', 'Bearer EAARaRBMdLV4BOZBZBdcggrC8eqTodet5vSViSXVTmo5MZCzrwnPZAKsZA9zlKgDOKVnRtcIDzcL5bnnK4Yr1wjEcngZCMqAvp4TIlyNKZAMVegOVESHssfiTiheMRLZBdc83ZC8Y58ZBYRblNNvHlLR3q7sDTyNhMuBEzJKcLtHC9H3YtOkYibO0taQJX8VWzdskh3XYXNyrmrOZCblQfTVHW7Nc9nEACV6bqgx1EnlZC3Bn4boZD');
            service.addHeader('Content-Type', 'application/json');
            return (args) ? JSON.stringify(args.data) : null;
        },
        parseResponse: function (service, client) {
            var result = {
                text: client.text,
                headers: client.getResponseHeaders() ? client.getResponseHeaders() : null
            }
            return client.text;
        },
        getRequestLogMessage: function (request) {
            return JSON.stringify(request);
        },
        getResponseLogMessage: function (response) {
            return response.text;
        },
    });
}

function responseFilter(httpResponse) {
    if (httpResponse.status !== 'OK') {
        var errorResult = {
            statusCode: httpResponse.status,
            errorMessage: JSON.parse(httpResponse.getErrorMessage()),
            // url: url
        };
        return errorResult;
    }
    // return a plain javascript object
    return JSON.parse(httpResponse.object);
}

function whatsAppCall(data) {
    initservice();
    svc.setRequestMethod('POST');
    var httpResponse = svc.call({ data: data });
    return responseFilter(httpResponse);
}

module.exports = {
    whatsAppCall: whatsAppCall
};