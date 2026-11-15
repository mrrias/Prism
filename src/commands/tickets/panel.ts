import {
    Declare,
    Command,
    MessageFlags,
    type CommandContext,
    Container,
    TextDisplay,
    ActionRow,
    Button,
    ButtonStyle,
} from "seyfert";



//  command information  //

const container = new Container().addComponents(
    new TextDisplay().setContent("### Prism Tickets\nOpen a ticket by clicking below.")
);

const button = new Button()
    .setCustomId("ticket:create")
    .setLabel("Open Ticket")
    .setStyle(ButtonStyle.Primary);

const row = new ActionRow<Button>()
    .setComponents([button]);


@Declare({
    name: "panel",
    description: "Create the support ticket panel"
})



//  command execution  //

export default class TicketPanel extends Command {
    async run(ctx: CommandContext) {

        await ctx.write({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }
}