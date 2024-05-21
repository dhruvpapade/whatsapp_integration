'use strict';

module.exports = {
    LIST_SIZE : 9,
    MARK_MESSAGES_READ : {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": "MESSAGE_ID"
    },
    REPLY_BUTTON : {
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
    },
    MAIN_MENU : {
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
    },
    BUTTON_REPLY_ARRAY : {
        "categories": "🔎 Categories",
        "my_orders": "📦 My Orders",
        "wistList": "🖤 Wish List"
    },
    PRODUCT_BUTTON_ARRAY : {
        "showMoreImages": "🖼️ More Images",
        "orderProduct": "🛒 Order Product",
        "addTowistList": "🖤 Add to Wish List"
    },
    REPLY_TO_LIST : {
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
                "sections": []
            }
        }
    },
    REPLY_TO_TEXT : {
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
    },
    IMAGE_BY_URL : {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "Recipient-Phone-Number",
        "type": "image",
        "image": {
            "link": "http(s)://image-url"
        }
    },
    RATING : '⭐'
};
