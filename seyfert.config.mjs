
import "dotenv/config";

import { config } from "seyfert";

export default config.bot({
    token: process.env.BOT_TOKEN ?? "",

    locations: {
        base: "dist",
        commands: "commands",
        events: "events",
        components: "components"
    },

    intents: [
        "Guilds",
        "MessageContent"
    ]
});
