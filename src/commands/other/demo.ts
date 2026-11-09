
import {
    Declare,
    Command,
    type CommandContext,
    TextDisplay,
    Container,
    MessageFlags
} from "seyfert";



//  command information  //

const components = new Container().addComponents(
    new TextDisplay().setContent(
        "Test"
    )
)

@Declare({
    name: "demo",
    description: "Test"
})


//  command execution  //

export default class PingCommand extends Command {
    async run(ctx: CommandContext) {

        await ctx.write({
            components: [components], 
            flags: MessageFlags.IsComponentsV2        
        })
    }
}
