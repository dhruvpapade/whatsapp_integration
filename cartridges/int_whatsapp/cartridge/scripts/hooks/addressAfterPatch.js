'use strict';

const Status = require('dw/system/Status');
const Transaction = require('dw/system/Transaction');

exports.afterPATCH = function (customer, addressName, customerAddress) {

    Transaction.wrap(function () {
        customerAddress.title = 'HOOK modified Title';
    });

    return new Status(Status.OK);
}
