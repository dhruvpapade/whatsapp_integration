'use strict';

// API includes
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var svc;

function initservice() {
    // Create a service object
    svc = LocalServiceRegistry.createService('whatsappAPI', {
        createRequest: function (service, args) {
            service.addHeader('Authorization', 'Bearer EAARaRBMdLV4BO253LoW1UZAaAhBIsIjuZA6NeyJaVm8aUO98MgpqxbNcl27aT4j0nik1u9VgFzJWxDZBYBV0cZAo6KeLmdUTaFlbYRYVf9wMVnVCXoUjph213ISkvwLBaHRYK6IJPbS6vS6k30FHM7ad219CuZAbWj1uHZCht1SPfFcn6Boc4oAVsHGj7XZA2iqfMISZBqi3sxVI3LWFSeHBN9gLH2YZD');
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

function whatsappcall(data) {
    initservice();
    svc.setRequestMethod('POST');
    var httpResponse = svc.call({ data: data });
    return responseFilter(httpResponse);
}

module.exports = {
    whatsappcall: whatsappcall
};