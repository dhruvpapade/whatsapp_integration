'use strict';

var server = require('server');
var Logger = require('dw/system/Logger');


server.get('Show', function (req, res, next) {

    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

    var ftpService = LocalServiceRegistry.createService('test', {
        createRequest: function (service) {
            var args = Array.prototype.slice.call(arguments, 1);
            //service.setOperation.apply(service, args);
            return service;
        },
        parseResponse: function (service, result) {
            return result;
        }
    });


    //Logger.error('exception: {0} ', e);
    var File = require('dw/io/File');
    var path = dw.io.File.IMPEX + '/src/';
	var file = new File(path +'Inventory.jpg');
    

    var serviceResult = ftpService.call('getBinary', ftpService.URL, file);
    var isDownloadSuccessful = serviceResult.getObject();
    if (!serviceResult.isOk() || !isDownloadSuccessful) {
        throw new Error('SFTP Service: couldn\'t download file: ' + ftpService.URL + ' error: ' + serviceResult.getErrorMessage());
    }

    //Logger.error('exception: {0} ', e);

    //return new FtpClientHelper(ftpService);

    res.json({
        //'ftpService': ftpService + '    jjjj',
        isDownloadSuccessful:isDownloadSuccessful,
        aa:'aa'
    });
    // return ftpService;

    next();

});

module.exports = server.exports();