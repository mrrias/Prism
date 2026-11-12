import {
    Declare,
    Command,
    type CommandContext,
    TextDisplay,
    Container,
    MessageFlags
} from "seyfert";



//   command information  //

const guideContainer = new Container().addComponents(
    new TextDisplay().setContent(
        "# Welcome to the Prism!\n\n" +
        "Here is everything you need to know to get started and navigate your way around."
    ),
    new TextDisplay().setContent(
        "### Useful Channels\n" +
        "- [**Announcements:**](https://discord.com/channels/1566781855183667250/1566794245438705734) Check here for updates and news.\n" +
        "- [**Rules:**](https://discord.com/channels/1566781855183667250/1566794255928922122) Update yourself on the rules here.\n" +
        "- [**General:**](https://discord.com/channels/1566781855183667250/1568919135256191016) Our main community chat.\n" +
        "- [**Feedback & Help:**](https://discord.com/channels/1566781855183667250/1568920045747306598) Ping staff here with any feedback or questions."
    )
);

@Declare({
    name: "help",
    description: "Get a general guide for Prism."
})


//   command execution  //

export default class ServerGuideCommand extends Command {
    async run(ctx: CommandContext) {

        await ctx.write({
            components: [guideContainer], 
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        })
    }
}