
import { createEvent } from "seyfert";



//  event information  //

export default createEvent({
    data: {
        name: "botReady",
        once: true
    },



//  event execution  //

    run(user, client) {

        // log successful login
        client.logger.info(
            `Ready! Logged in as ${user.username}`
        );

    }
});
