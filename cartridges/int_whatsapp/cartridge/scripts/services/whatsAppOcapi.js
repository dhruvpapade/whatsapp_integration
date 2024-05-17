'use strict';

// API includes
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var svc;

var serviceEndpoints = {
    customerAuth:{
        url: '{0}/customers/auth',
        method: 'POST',
    },
    getCategories: {
        url: '{0}/categories/root',
        method: 'GET',
    },
};

function initservice() {
    // Create a service object
    svc = LocalServiceRegistry.createService('whatsapp.ocapi', {
        createRequest: function (service, args) {
            //service.addHeader('Authorization', 'Bearer EAARaRBMdLV4BOZCbmUqtxZASJaYsho9aaycMytyRKcRdkSr9eKu6CViQwx6bZBMpUxsxsyYAAYimNZAHgZAgdAjkoIhOuqYdv2tfwopiWQZAHoZBtPcKpKgWD9mcjfZCH6jPe5VmU8FRiBQ8OWMEhhQzC3XcWV1ly1eINKoKNwFqZC90KT5KizfW6m64ycAM2ep6CXQxOewIEieSZBy318AZBRtPb6ywhvz');
            service.addHeader('Content-Type', 'application/json');
            service.addHeader('x-dw-client-id', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
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

function whatsAppOCAPICall (data) {
    initservice();
    svc.setURL(require('dw/util/StringUtils').format(data.url, svc.getURL()));
    svc.setRequestMethod(data.method);
    var httpResponse = data.method === 'GET' ? svc.call() : svc.call(data.param);
    return responseFilter(httpResponse);
}

module.exports = {
    serviceEndpoints: serviceEndpoints,
    whatsAppOCAPICall: whatsAppOCAPICall
};
