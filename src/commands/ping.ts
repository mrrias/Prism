
import {
    Declare,
    Command,
    type CommandContext
} from "seyfert";



//  command information  //

@Declare({
    name: "ping",
    description: "Check Prism's response"
})



//  command execution  //

export default class PingCommand extends Command {
    async run(ctx: CommandContext) {

        // send response
        await ctx.write({
            content: "Pong!"
        });

    }
}
