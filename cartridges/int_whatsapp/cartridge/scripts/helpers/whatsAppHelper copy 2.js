'use strict';

var whatsAppService = require('~/cartridge/scripts/services/whatsAppService');
var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');
var whatsAppConstants = require('~/cartridge/scripts/util/whatsAppConstants');
var whatsAppModel = require('~/cartridge/models/whatsApp');
var whatsAppProductHelper = require('~/cartridge/scripts/helpers/whatsAppProductHelper');
var URLUtils = require('dw/web/URLUtils');

function notifyMsgRead(message_id) {

    var data = whatsAppConstants.MARK_MESSAGES_READ;
    data.message_id = message_id;
    var serviceResp;
    try {
        serviceResp = whatsAppService.whatsappcall(data);
        //Logger.error('notifyMsgReadserviceResp: {0} ', JSON.stringify(serviceResp));
    } catch (e) {
        Logger.error('notifyMsgServiceResp_exception: {0} ', e);
    };

    return serviceResp;

}


function getcategories(whatsApp) {

    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var categories = CatalogMgr.getSiteCatalog().getRoot().getOnlineSubCategories().toArray();//.filter((item, i, ar) => ar.indexOf(item) === i);
    var category = [];

    categories.forEach(function (element, index) {
        if (index < 10 && element.custom.showInMenu && (element.hasOnlineProducts() || element.hasOnlineSubCategories())) {
            var cat = {
                "id": 'cgid=' + element.ID,
                "title": element.displayName.substring(0, 24),
                "description": element.description ? element.description : '',
            }
            category.push(cat);
        }
    });

    var data = whatsAppConstants.CATEGORIES;
    data.to = whatsApp.from;
    data.interactive.header.text = Resource.msg('header', 'whatsapp', null);
    data.interactive.body.text = Resource.msgf('category.bodyText', 'whatsapp', null, whatsApp.user_name);
    data.interactive.footer.text = Resource.msg('footer', 'whatsapp', null);
    data.interactive.action.sections[0].rows = category;
    data.interactive.action.sections[0].title = Resource.msg('category.sections.title', 'whatsapp', null);
    data.interactive.action.button = Resource.msg('category.btnText', 'whatsapp', null);

    return data;
}


function getSubcategoriesOrProducts(whatsApp, cgid, start) {

    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var categories = CatalogMgr.getCategory(cgid);
    var data;

    if (categories.hasOnlineSubCategories() && categories.hasOnlineProducts()) {
        var categoryList = categories.getOnlineSubCategories().toArray();//.filter((item, i, ar) => ar.indexOf(item) === i);
        var category = [];
        categoryList.forEach(function (element, index) {
            if (index < 10 && element.custom.showInMenu && (element.hasOnlineProducts() || element.hasOnlineSubCategories())) {
                var cat = {
                    "id": 'cgid=' + element.ID,
                    "title": element.displayName.substring(0, 24),
                    "description": element.description ? element.description : ''
                }
                category.push(cat);
            }
        });

        data = whatsAppConstants.CATEGORIES;
        data.to = whatsApp.from;
        data.interactive.header.text = Resource.msg('header', 'whatsapp', null);
        data.interactive.body.text = Resource.msgf('subcategory.bodyText', 'whatsapp', null, whatsApp.user_name);
        data.interactive.footer.text = Resource.msg('footer', 'whatsapp', null);
        data.interactive.action.sections[0].rows = category;
        data.interactive.action.sections[0].title = whatsApp.msg_body.list_reply.title;
        data.interactive.action.button = Resource.msg('subcategory.btnText', 'whatsapp', null);

    } else {

        var productList = whatsAppProductHelper.getProductsList(cgid, start)

        data = whatsAppConstants.CATEGORIES;
        data.to = whatsApp.from;
        data.interactive.header.text = Resource.msg('header', 'whatsapp', null);
        data.interactive.body.text = Resource.msgf('product.bodyText', 'whatsapp', null, whatsApp.user_name);
        data.interactive.footer.text = Resource.msg('footer', 'whatsapp', null);
        data.interactive.action.sections[0].rows = productList;
        data.interactive.action.sections[0].title = cgid;//Resource.msg('product.btnText', 'whatsapp', null);
        data.interactive.action.button = Resource.msg('product.btnText', 'whatsapp', null);

    }

    return data;
}


function getProductDetails(whatsApp, productID) {

    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var apiProduct = ProductFactory.get({ pid: productID });
    // Logger.error('apiProduct {0}', JSON.stringify(apiProduct));
    var listPrice = (apiProduct.price.list !== null) ? '~' + apiProduct.price.list.formatted + '~' : '';
    var salesPrice = (apiProduct.price.sales !== null) ? apiProduct.price.sales.formatted : '';
    var price = listPrice + salesPrice;

    var data = whatsAppConstants.PRODUCT_DETAILS;
    data.to = whatsApp.from;
    data.interactive.body.text = Resource.msgf('product.details', 'whatsapp', null, apiProduct.productName, apiProduct.id, price, apiProduct.shortDescription, apiProduct.longDescription, URLUtils.abs('Product-Show', 'pid', productID));
    data.interactive.action.buttons[0].reply.id = "add_to_cart";
    data.interactive.action.buttons[0].reply.title = "Add to Cart";

    return data;
}

function processWhatsAppCall(payload) {

    var storeReqStatus = true;
    var whatsApp = new whatsAppModel(payload);
    Logger.error('processWhatsAppCall: {0} ', JSON.stringify(whatsApp));
    notifyMsgRead(whatsApp.ID);

    if (whatsApp.msg_type == 'text') {
        var data = getcategories(whatsApp);

    } else if (whatsApp.msg_type == 'interactive') {

        if (whatsApp.msg_body.type == 'list_reply') {
            if (whatsApp.msg_body.list_reply.id.includes("pid") === true) {

                var productID = whatsApp.msg_body.list_reply.id.trim().split("=")[1];
                var data = getProductDetails(whatsApp, productID);

            } else if (whatsApp.msg_body.list_reply.id.includes("cgid") === true) {

                if (whatsApp.msg_body.list_reply.id.includes("start") === true) {
                    var Arr = whatsApp.msg_body.list_reply.id.trim().split("&");

                    const startval = Arr.find(element => {
                        if (element.includes("start")) { return true; }
                    });
                    const categoryID = Arr.find(element => {
                        if (element.includes("cgid")) { return true; }
                    });

                    var start = startval.trim().split("=")[1];
                    var cgid = categoryID.trim().split("=")[1];

                    var data = getSubcategoriesOrProducts(whatsApp, cgid, start);

                } else {
                    var cgid = whatsApp.msg_body.list_reply.id.trim().split("=")[1];
                    var data = getSubcategoriesOrProducts(whatsApp, cgid, 0);
                }
            }

        } else if (whatsApp.msg_body.type == 'button_reply') {
            Logger.error('button_reply {0}', JSON.stringify(whatsApp));
        }
    }

    // Logger.error('data: {0} ', JSON.stringify(data));

    try {
        var serviceResp = whatsAppService.whatsappcall(data);
        Logger.error('serviceResp: {0} ', JSON.stringify(serviceResp));
        serviceResp.statusCode == 'ERROR' ? storeReqStatus = false : storeReqStatus = true;
    } catch (e) {
        storeReqStatus = false;
        Logger.error('serviceResp_exception: {0} ', JSON.stringify(e));
    }

    return storeReqStatus;

}

module.exports = {
    processWhatsAppCall: processWhatsAppCall
};