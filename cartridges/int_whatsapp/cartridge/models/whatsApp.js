'use strict';

function whatsApp(whatsAppObject) {
    if (whatsAppObject) {
        this.currentSite = dw.system.Site.getCurrent();
        this.ID = whatsAppObject.entry[0].changes[0].value.messages[0].id;
        this.contacts = whatsAppObject.entry[0].changes[0].value.contacts[0];
        this.messages = whatsAppObject.entry[0].changes[0].value.messages[0];
        this.from = whatsAppObject.entry[0].changes[0].value.messages[0].from;
        this.user_name = whatsAppObject.entry[0].changes[0].value.contacts[0].profile.name;
        this.msg_type = whatsAppObject.entry[0].changes[0].value.messages[0].type;

        if (whatsAppObject.entry[0].changes[0].value.messages[0].context) {
            this.parentMsg_id = whatsAppObject.entry[0].changes[0].value.messages[0].context.id;
        }

        if (this.msg_type == "interactive") {
            this.msg_body = whatsAppObject.entry[0].changes[0].value.messages[0].interactive;
        }

        if (this.msg_type == "text") {
            this.msg_body = whatsAppObject.entry[0].changes[0].value.messages[0].text;
        }

        return this;
    }
}

module.exports = whatsApp;