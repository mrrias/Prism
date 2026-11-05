"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
//  event information  //
exports.default = (0, seyfert_1.createEvent)({
    data: {
        name: "botReady",
        once: true
    },
    //  event execution  //
    run(user, client) {
        // log successful login
        client.logger.info(`Ready! Logged in as ${user.username}`);
    }
});
