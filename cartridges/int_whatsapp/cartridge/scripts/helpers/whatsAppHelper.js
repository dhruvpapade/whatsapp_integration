'use strict';

var whatsAppService = require('~/cartridge/scripts/services/whatsAppService');
var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var whatsAppConstants = require('~/cartridge/scripts/util/whatsAppConstants');
var whatsAppModel = require('~/cartridge/models/whatsApp');
var whatsAppProductHelper = require('~/cartridge/scripts/helpers/whatsAppProductHelper');
var URLUtils = require('dw/web/URLUtils');

/**
 * function name : notifyMsgRead
 * purpose : notify the user that the message has been received
 */
function notifyMsgRead(message_id) {
    var data = whatsAppConstants.MARK_MESSAGES_READ;
    data.message_id = message_id;
    return serviceCall(data);
}

/**
 * function name : getcategories
 * purpose : fetch all the available categories of the current site
 */
function getcategories(whatsApp) {
    var CatalogMgr = require('dw/catalog/CatalogMgr'),
        category = [],
        categories = CatalogMgr.getSiteCatalog().getRoot().getOnlineSubCategories().toArray(); //.filter((item, i, ar) => ar.indexOf(item) === i);

    categories.forEach(function (element, index) {
        if (index < 10 && element.custom.showInMenu && (element.hasOnlineProducts() || element.hasOnlineSubCategories())) {
            var cat = {
                "id": 'cgid=' + element.ID,
                "title": element.displayName.substring(0, 24),
                "description": '' // element.description ? element.description : '',
            }
            category.push(cat);
        }
    });

    var data = whatsAppConstants.REPLY_TO_LIST;
    data.to = whatsApp.from;
    //data.interactive.header.text = ' ';//whatsApp.currentSite.name;//Resource.msg('header', 'whatsapp', null);
    data.interactive.body.text = Resource.msgf('category.bodyText', 'whatsapp', null, whatsApp.user_name);
    //data.interactive.footer.text = Resource.msgf('footer', 'whatsapp', null, whatsApp.currentSite.name);
    data.interactive.action.sections[0].rows = category;
    data.interactive.action.sections[0].title = Resource.msg('category.sections.title', 'whatsapp', null);
    data.interactive.action.button = Resource.msg('category.btnText', 'whatsapp', null);
    data.context.message_id = whatsApp.ID;

    return data;
}

/**
 * function name : myOrders
 * purpose : fetch orders
 */
function myOrders(whatsApp) {
    var CustomerMgr = require('dw/customer/CustomerMgr'),
        OrderMgr = require('dw/order/OrderMgr'),
        orderList = [];

    var profile = CustomerMgr.searchProfile('phoneHome = {0}', whatsApp.from, null);
    if (!empty(profile)) {
        var currentCustomer = CustomerMgr.getCustomerByCustomerNumber(profile.customerNo);
        var orderHistory = currentCustomer.getOrderHistory();

        if (orderHistory.orderCount > 0) {
            var orders = orderHistory.orders;
            while (orders.hasNext()) {
                var order = orders.next();
                var orderdDetails = {
                    "id": 'orderId=' + order.orderNo,
                    "title": order.orderNo,
                    "description": Resource.msgf('order.list', 'whatsapp', null, order.getStatus().displayValue, order.creationDate),
                }
                orderList.push(orderdDetails);
            }

            var data = whatsAppConstants.REPLY_TO_LIST;
            data.to = whatsApp.from;
            //data.interactive.header.text = ' ';//whatsApp.currentSite.name;//Resource.msg('header', 'whatsapp', null);
            data.interactive.body.text = Resource.msgf('order.btnText', 'whatsapp', null, whatsApp.user_name);
            //data.interactive.footer.text = Resource.msgf('footer', 'whatsapp', null, whatsApp.currentSite.name);
            data.interactive.action.sections[0].rows = orderList;
            data.interactive.action.sections[0].title = 'My Orders';
            data.interactive.action.button = 'My Orders';
            data.context.message_id = whatsApp.ID;

            return data;
        }
    }
    data = whatsAppConstants.REPLY_TO_TEXT;
    data.to = whatsApp.from;
    data.text.body = Resource.msgf('order.notFound', 'whatsapp', null);
    data.context.message_id = whatsApp.ID;

    return data;
}

/**
 * function name : getOrderDetails
 * purpose : find order details based on the orderNo
 */
function getOrderDetails(whatsApp, orderNo) {
    var OrderModel = require('*/cartridge/models/order');
    var order = require('dw/order/OrderMgr').getOrder(orderNo);
    var orderModel = new OrderModel(order, {});

    var shippingAddress = orderModel.shipping[0].shippingAddress;
    var shipAddress = shippingAddress.firstName + ' ' + shippingAddress.lastName + '\n' + shippingAddress.address1 + '\n' + shippingAddress.city + ', ' + shippingAddress.stateCode + ', ' + shippingAddress.postalCode;

    var billingAddress = orderModel.billing.billingAddress.address;
    var billAddress = billingAddress.firstName + ' ' + billingAddress.lastName + '\n' + billingAddress.address1 + '\n' + billingAddress.city + ', ' + billingAddress.stateCode + ', ' + billingAddress.postalCode;

    var shippingMethod = orderModel.shipping[0].selectedShippingMethod.displayName;

    var payment = orderModel.billing.payment.selectedPaymentInstruments[0];
    var paymentMethod = payment.type + '\n' + payment.maskedCreditCardNumber + '\n' + payment.expirationMonth + '/' + payment.expirationYear;

    var total = 'Subtotal: ' + orderModel.totals.subTotal + '\nShipping: ' + orderModel.totals.orderLevelDiscountTotal.formatted + '\nSales Tax: ' + orderModel.totals.shippingLevelDiscountTotal.formatted + '\nTotal: ' + orderModel.totals.grandTotal;

    var products = '';
    orderModel.shipping[0].productLineItems.items.forEach(function (lineItem, index) {
        products += Resource.msgf('order.products', 'whatsapp', null, lineItem.productName, lineItem.priceTotal.price, lineItem.quantity, lineItem.priceTotal.price);

    });

    var data = whatsAppConstants.REPLY_TO_TEXT;
    data.to = whatsApp.from;
    data.text.body = Resource.msgf('order.details', 'whatsapp', null, orderModel.orderNumber, orderModel.creationDate, shipAddress, shippingMethod, billAddress, paymentMethod, products, total);
    data.context.message_id = whatsApp.ID;

    return data;

}

/**
 * function name : getSubcategoriesOrProducts
 * purpose : fetch all the available sub categories of the current site based on the cgid received othervise products
 */
function getSubcategoriesOrProducts(whatsApp, cgid, start) {
    var CatalogMgr = require('dw/catalog/CatalogMgr'),
        categories = CatalogMgr.getCategory(cgid),
        data;

    if (categories.hasOnlineSubCategories()) {
        var categoryList = categories.getOnlineSubCategories().toArray(); //.filter((item, i, ar) => ar.indexOf(item) === i);
        //Logger.error('getSubcategoriesOrProducts {0}', JSON.stringify(categoryList));
        var category = [];
        categoryList.forEach(function (element, index) {
            if (index < 10 && element.custom.showInMenu && (element.hasOnlineProducts() || element.hasOnlineSubCategories())) {
                var cat = {
                    "id": 'cgid=' + element.ID,
                    "title": element.displayName.substring(0, 24),
                    "description": '' //element.description ? element.description : ''
                }
                category.push(cat);
            }
        });

        data = whatsAppConstants.REPLY_TO_LIST;
        data.to = whatsApp.from;
        // data.interactive.header.text = whatsApp.currentSite.name;//Resource.msg('header', 'whatsapp', null);
        data.interactive.body.text = Resource.msgf('subcategory.bodyText', 'whatsapp', null, whatsApp.user_name);
        //data.interactive.footer.text = Resource.msg('footer', 'whatsapp', null);
        data.interactive.action.sections[0].rows = category;
        data.interactive.action.sections[0].title = whatsApp.msg_body.list_reply.title;
        data.interactive.action.button = Resource.msg('subcategory.btnText', 'whatsapp', null);
        data.context.message_id = whatsApp.ID;

    } else {

        var productList = whatsAppProductHelper.getProductsList(cgid, start)

        data = whatsAppConstants.REPLY_TO_LIST;
        data.to = whatsApp.from;
        //data.interactive.header.text = whatsApp.currentSite.name;//Resource.msg('header', 'whatsapp', null);
        data.interactive.body.text = Resource.msgf('product.bodyText', 'whatsapp', null, whatsApp.user_name);
        //data.interactive.footer.text = Resource.msg('footer', 'whatsapp', null);
        data.interactive.action.sections[0].rows = productList;
        data.interactive.action.sections[0].title = cgid; //Resource.msg('product.btnText', 'whatsapp', null);
        data.interactive.action.button = Resource.msg('product.btnText', 'whatsapp', null);
        data.context.message_id = whatsApp.ID;

    }

    return data;
}

/**
 * function name : getProductDetails
 * purpose : fetch product details based on the pid
 */
function getProductDetails(whatsApp, pid) {

    var ProductFactory = require('*/cartridge/scripts/factories/product'),
        apiProduct = ProductFactory.get({ pid: pid }),
        price = productFormattedPrice(apiProduct.price),
        rating = apiProduct.rating ? whatsAppConstants.RATING.repeat(apiProduct.rating) : '',
        productMainBtn = [],
        btnARR = whatsAppConstants.PRODUCT_BUTTON_ARRAY;

    Logger.error('getProductDetails {0}', JSON.stringify(apiProduct));

    var category = [];
    for (var btnkey in btnARR) {
        var Btn = {
            "type": "reply",
            "reply": {
                "id": btnkey + '&pid=' + pid,
                "title": btnARR[btnkey]
            }
        };
        productMainBtn.push(Btn);
    }

    var data = whatsAppConstants.REPLY_BUTTON;
    data.to = whatsApp.from;
    data.interactive.body.text = Resource.msgf('product.details', 'whatsapp', null, apiProduct.productName, apiProduct.id, price.trim(), rating, apiProduct.shortDescription, apiProduct.longDescription, URLUtils.abs('Product-Show', 'pid', pid));
    data.interactive.header.image.link = apiProduct.images.large[0].absURL;
    data.interactive.action.buttons = productMainBtn;
    data.context.message_id = whatsApp.ID;

    return data;
}

/**
 * function name : price
 * purpose : product price
 */
function productFormattedPrice(price) {

    if (price.type === 'range') {

        var minlistPrice = (price.min.list !== null) ? '~' + price.min.list.formatted + '~' : '',
            minsalesPrice = (price.min.sales !== null) ? '*' + price.min.sales.formatted + '*' : '',
            minPrice = minlistPrice + ' ' + minsalesPrice,
            maxlistPrice = (price.max.list !== null) ? '~' + price.max.list.formatted + '~' : '',
            maxsalesPrice = (price.max.sales !== null) ? '*' + price.max.sales.formatted + '*' : '',
            maxPrice = maxlistPrice + ' ' + maxsalesPrice;

        return price = minPrice.trim() + ' - ' + maxPrice.trim();

    } else if (price.type === 'tiered') {
        if (price.useSimplePrice) {
            return price = 'Starting from ' + price.startingFromPrice.sales.formatted;
        }
        return '$12,000';

    } else {
        var listPrice = (price.list !== null) ? '~' + price.list.formatted + '~' : '',
            salesPrice = (price.sales !== null) ? '*' + price.sales.formatted + '*' : '';
        return price = listPrice + ' ' + salesPrice;
    }
}

/**
 * function name : getmain
 * purpose : main page i.e. homepage
 */
function getmain(whatsApp) {
    var mainBtn = [],
        btnARR = whatsAppConstants.BUTTON_REPLY_ARRAY;
    for (var btnkey in btnARR) {
        var Btn = {
            "type": "reply",
            "reply": {
                "id": btnkey,
                "title": btnARR[btnkey]
            }
        };
        mainBtn.push(Btn);
    }

    var data = whatsAppConstants.MAIN_MENU;
    data.to = whatsApp.from;
    data.interactive.body.text = Resource.msgf('main.bodyText', 'whatsapp', null, whatsApp.user_name);
    //data.interactive.footer.text = Resource.msg('main.searchNote', 'whatsapp', null);
    //data.interactive.header.image.link = apiProduct.images.large[0].absURL;
    data.interactive.action.buttons = mainBtn;

    //Logger.error('getmain1 {0}', JSON.stringify(category));
    return data;
}

/**
 * function name : getSuggestions
 * purpose : find the all possible products and categories based on the searchTerms
 */
function getSuggestions(whatsApp, searchTerms) {
    var suggestionsList = whatsAppProductHelper.getSearchSuggestionsList(searchTerms);
    //Logger.error('suggestionsList: {0} ', JSON.stringify(suggestionsList));

    if (suggestionsList.length !== 0) {

        var data = whatsAppConstants.REPLY_TO_LIST;
        data.to = whatsApp.from;
        //data.interactive.header.text = whatsApp.currentSite.name;//Resource.msg('header', 'whatsapp', null);
        data.interactive.body.text = Resource.msg('search.bodyText', 'whatsapp', null);
        //data.interactive.footer.text = Resource.msg('footer', 'whatsapp', null);
        data.interactive.action.sections = suggestionsList;
        data.interactive.action.button = Resource.msg('product.btnText', 'whatsapp', null);
        data.context.message_id = whatsApp.ID;

        return data;

    } else {

        var data = whatsAppConstants.REPLY_TO_TEXT;
        data.to = whatsApp.from;
        data.text.body = Resource.msgf('search.noResult', 'whatsapp', null, searchTerms);
        data.context.message_id = whatsApp.ID;

        return data;
    }
}

/**
 * function name : getMoreImages
 * purpose : find the all possible products images based on the pid
 */
function getMoreImages(whatsApp, pid) {
    var ProductFactory = require('*/cartridge/scripts/factories/product'),
        apiProduct = ProductFactory.get({ pid: pid }),
        data;

    if (apiProduct.images.large.length > 1) {
        apiProduct.images.large.forEach(function (element, index) {
            var data = whatsAppConstants.IMAGE_BY_URL;
            data.to = whatsApp.from;
            data.image.link = element.absURL;

            return serviceCall(data);

        });

        data = whatsAppConstants.REPLY_TO_TEXT;
        data.to = whatsApp.from;
        data.text.body = Resource.msg('product.nomoreimages.success', 'whatsapp', null);

    } else {
        data = whatsAppConstants.REPLY_TO_TEXT;
        data.to = whatsApp.from;
        data.text.body = Resource.msgf('product.nomoreimages.error', 'whatsapp', null, apiProduct.productName);
        data.context.message_id = whatsApp.ID;
    }

    return data;
}

/**
 * function name : serviceCall
 * purpose : call service
 */
function serviceCall(data) {
    var serviceStatus = true;
    try {
        var serviceResp = whatsAppService.whatsappcall(data);
        //Logger.error('serviceResp: {0} ', JSON.stringify(serviceResp));
        serviceResp.statusCode == 'ERROR' ? serviceStatus = false : serviceStatus = true;
    } catch (e) {
        serviceStatus = false;
        Logger.error('whatsApp_serviceCall_exception: {0} ', JSON.stringify(e));
    }
    return serviceStatus;
}

/**
 * function name : processWhatsAppCall
 * purpose : process message received from the user
 */
function processWhatsAppCall(payload) {
    var data,
        whatsApp = new whatsAppModel(payload);
    //Logger.error('processWhatsAppCall: {0} ', JSON.stringify(whatsApp));
    notifyMsgRead(whatsApp.ID);

    switch (whatsApp.msg_type) {
        case 'text':
            if (whatsApp.msg_body.body.toLowerCase().includes('search=')) {
                var searchTerms = whatsApp.msg_body.body.split("=")[1].trim();
                data = getSuggestions(whatsApp, searchTerms);
            } else {
                data = getmain(whatsApp);
            }
            break;

        case 'interactive':
            switch (whatsApp.msg_body.type) {
                case 'list_reply':
                    var list_reply_id = whatsApp.msg_body.list_reply.id;

                    if (list_reply_id.includes("pid")) {

                        var productID = list_reply_id.trim().split("=")[1];
                        data = getProductDetails(whatsApp, productID);

                    } else if (list_reply_id.includes("cgid")) {

                        if (list_reply_id.includes("start")) {
                            var Arr = list_reply_id.trim().split("&");

                            const startval = Arr.find(element => { if (element.includes("start")) { return true; } });
                            const categoryID = Arr.find(element => { if (element.includes("cgid")) { return true; } });

                            var start = startval.trim().split("=")[1];
                            var cgid = categoryID.trim().split("=")[1];

                            data = getSubcategoriesOrProducts(whatsApp, cgid, start);

                        } else {
                            var cgid = list_reply_id.trim().split("=")[1];
                            data = getSubcategoriesOrProducts(whatsApp, cgid, 0);
                        }

                    } else if (list_reply_id.includes('search=')) {
                        var searchTerms = list_reply_id.trim().split("=")[1];
                        data = getSuggestions(whatsApp, searchTerms);

                    } else if (list_reply_id.includes('orderId')) {
                        var orderNo = list_reply_id.trim().split("=")[1];
                        data = getOrderDetails(whatsApp, orderNo);
                    }
                    break;

                case 'button_reply':
                    var btnReplyId = whatsApp.msg_body.button_reply.id;

                    if (btnReplyId.includes('showMoreImages')) {
                        var Arr = btnReplyId.trim().split("&");
                        const pidval = Arr.find(element => {
                            if (element.includes("pid")) {
                                return true;
                            }
                        });
                        var pid = pidval.trim().split("=")[1];
                        data = getMoreImages(whatsApp, pid);

                    } else if (btnReplyId == 'categories') {
                        data = getcategories(whatsApp);
                    } else if (btnReplyId == 'my_orders') {
                        data = myOrders(whatsApp);
                    }
                    break;
            }
            break;
    }

    //Logger.error('data: {0} ', JSON.stringify(data));

    return serviceCall(data);
}

module.exports = {
    processWhatsAppCall: processWhatsAppCall
};