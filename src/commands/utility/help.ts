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

export default class HelpCommand extends Command {
    async run(ctx: CommandContext) {
        await ctx.deferReply(true);

        await ctx.editOrReply({
            content: "This command is currently under development :("
        });
    }
}