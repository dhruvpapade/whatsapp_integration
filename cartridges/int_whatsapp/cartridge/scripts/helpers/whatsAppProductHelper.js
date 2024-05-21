'use strict';

var Logger = require('dw/system/Logger');
var whatsAppConstants = require('~/cartridge/scripts/util/whatsAppConstants');

function getProductsList(cgid, start, pageSize) {

    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var PagingModel = require('dw/web/PagingModel');
    var startIndex = start || 0;
    pageSize = pageSize || whatsAppConstants.LIST_SIZE;
    var categories = CatalogMgr.getCategory(cgid).getOnlineProducts();

    var pagingModel = new PagingModel(categories);
    pagingModel.setStart(startIndex);
    pagingModel.setPageSize(pageSize);

    var productList = [];

    var iter = pagingModel.pageElements;
    while (iter !== null && iter.hasNext()) {
        var element = iter.next();
        var product = {
            "id": 'pid=' + element.ID,
            "title": element.name.substring(0, 24),
            "description": 'ID: ' + element.ID
        }

        productList.push(product);
    }
    var nxtstart = parseInt(startIndex) + parseInt(pageSize);
    if (categories.size() > nxtstart) {
        var product1 = {
            "id": 'cgid=' + cgid + '&start=' + nxtstart,
            "title": 'More Products',
            "description": '',
        }
        productList.push(product1);
    }
    return productList;

}

function getSearchSuggestionsList(searchTerms) {
    var SuggestModel = require('dw/suggest/SuggestModel');
    var CategorySuggestions = require('*/cartridge/models/search/suggestions/category');
    var ProductSuggestions = require('*/cartridge/models/search/suggestions/product');
    var categorySuggestions;
    var productSuggestions;
    var suggestions;
    var result = [];

    var maxSuggestions = 4;

    suggestions = new SuggestModel();
    suggestions.setFilteredByFolder(false);
    suggestions.setSearchPhrase(searchTerms);
    suggestions.setMaxSuggestions(maxSuggestions);
    categorySuggestions = new CategorySuggestions(suggestions, maxSuggestions);
    productSuggestions = new ProductSuggestions(suggestions, maxSuggestions);

    if (productSuggestions.available) {

        if (productSuggestions.phrases[0].exactMatch === false) {
            var val = productSuggestions.phrases[0].value;
            var phrase = {
                "title": "Do you mean?",
                "rows": [
                    {
                        "id": 'search=' + val,
                        "title": val.substring(0, 24),
                        "description": ''
                    }
                ]
            };
            result.push(phrase);
        }

        var productData = {
            "title": "Products",
            "rows": []
        };
        productSuggestions.products.forEach(function (element, index) {
            var product = {
                "id": 'pid=' + element.id,
                "title": element.name.substring(0, 24),
                "description": 'ID: ' + element.id
            }
            productData.rows.push(product);
        });
        result.push(productData);
    }

    if (categorySuggestions.available) {
        var categoryData = {
            "title": "Categories",
            "rows": []
        };
        categorySuggestions.categories.forEach(function (element, index) {
            var category = {
                "id": 'cgid=' + element.id,
                "title": element.name.substring(0, 24),
                "description": 'in '+element.parentName
            }
            categoryData.rows.push(category);
        });
        result.push(categoryData);
    }

    return result;

}

module.exports = {
    getProductsList: getProductsList,
    getSearchSuggestionsList: getSearchSuggestionsList,
};