'use strict';

// API includes
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var svc;

function initservice() {
    // Create a service object
    svc = LocalServiceRegistry.createService('whatsappAPI', {
        createRequest: function (service, args) {
            service.addHeader('Authorization', 'Bearer EAALVPDAUQCsBAKgoOflnbgb9dtcZAtUZCg3fUjCyDxKKfnIlse8VZBynPwWrH0ZBwh0DvU63awby4Kar7eR2LSEnhFi0ZB8tFcTyIeEL1vHEaXEcFIhTIUZBeR7RP1VdgM58phPAgrQXb5fPSZBZA9G3hnQrbG0syWPQRnA5Y5oCDBb8Vl2yDOZBhBUk5vfWVmeMYXGmoZAIX187FxkklYFZAFR');
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

function whatsappcall() {
    initservice();
    svc.setRequestMethod('POST');
    // svc.setURL(svc.getURL() + '/v1/car/address/validation');

    var data = {
        "messaging_product": "whatsapp",
        "to": "919987204154",
        "type": "template",
        "template": {
            "name": "custom",
            "language": {
                "code": "en_US"
            }
        }
    };

    return svc.call({ data: data });
    //return responseFilter(httpResult);
}

module.exports = {
    whatsappcall: whatsappcall
};