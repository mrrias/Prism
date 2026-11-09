
import {
    Declare,
    Command,
    type CommandContext,
    MessageFlags
} from "seyfert";



//  command information  //

@Declare({
    name: "help",
    description: "Send quick guide and resources to help make things easier here at Prism."
})



//  command execution  //

export default class PingCommand extends Command {
    async run(ctx: CommandContext) {

        await ctx.write({
            content: "This command is currently under development :(",
            flags: MessageFlags.Ephemeral
        })
    }
}