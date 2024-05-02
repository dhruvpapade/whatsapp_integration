'use strict';

var MARK_MESSAGES_READ = {
    "messaging_product": "whatsapp",
    "status": "read",
    "message_id": "MESSAGE_ID"
};

var REPLY_BUTTON = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "Recipient-Phone-Number",
    "type": "interactive",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "interactive": {
        "type": "button",
        "header": {
            "type": "image",
            "image": {
                "link": "https://www.martechcube.com/wp-content/uploads/2018/06/e-commerce-platforms.jpg"
            }
        },
        "body": {
            "text": "<BUTTON_TEXT>"
        },
        "action": {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {}
                }
            ]
        }
    }
}

var MAIN_MENU = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "Recipient-Phone-Number",
    "type": "interactive",
    "interactive": {
        "type": "button",
        "header": {
            "type": "image",
            "image": {
                "link": "https://www.martechcube.com/wp-content/uploads/2018/06/e-commerce-platforms.jpg"
            }
        },
        "body": {
            "text": "<BUTTON_TEXT>"
        },
        "action": {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {}
                },
                {
                    "type": "reply",
                    "reply": {}
                }
            ]
        }
    }
};

var BUTTON_REPLY_ARRAY = {
    "categories": "🔎 Categories",
    "my_orders": "📦 My Orders",
    "wistList": "🖤 Wish List"
};

var PRODUCT_BUTTON_ARRAY = {
    "showMoreImages": "🖼️ More Images",
    "orderProduct": "🛒 Order Product",
    "addTowistList": "🖤 Add to Wish List"
};

var REPLY_TO_LIST = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "Recipient-Phone-Number",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "interactive",
    "interactive": {
        "type": "list",
        "body": {
            "text": "<BODY_TEXT>"
        },
        "action": {
            "button": "<BUTTON_TEXT>",
            "sections": [
                {
                    "title": "<LIST_SECTION_1_TITLE>",
                    "rows": []
                }
            ]
        }
    }
};

var REPLY_TO_TEXT = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "Recipient-Phone-Number",
    "context": {
        "message_id": "<MSGID_OF_PREV_MSG>"
    },
    "type": "text",
    "text": {
        "preview_url": false,
        "body": "<TEXT_MSG_CONTENT>"
    }
};

var IMAGE_BY_URL = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "Recipient-Phone-Number",
    "type": "image",
    "image": {
        "link": "http(s)://image-url"
    }
};


var RATING = '⭐';

module.exports.MAIN_MENU = MAIN_MENU;
module.exports.REPLY_TO_LIST = REPLY_TO_LIST;
module.exports.MARK_MESSAGES_READ = MARK_MESSAGES_READ;
module.exports.REPLY_BUTTON = REPLY_BUTTON;
module.exports.BUTTON_REPLY_ARRAY = BUTTON_REPLY_ARRAY;
module.exports.REPLY_TO_TEXT = REPLY_TO_TEXT;
module.exports.PRODUCT_BUTTON_ARRAY = PRODUCT_BUTTON_ARRAY;
module.exports.IMAGE_BY_URL = IMAGE_BY_URL;
module.exports.RATING = RATING;