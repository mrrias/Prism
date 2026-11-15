// AI assistance
// needs to be reviewed and properly edited

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

@Declare({
    name: "panel",
    description: "Create the support ticket panel"
})
export default class TicketPanel extends Command {
    async run(ctx: CommandContext) {
        // create components v2 container //
        const container = new Container().addComponents(
            new TextDisplay().setContent("### Prism Tickets\nOpen a ticket by clicking below.")
        );

        // create button //
        const button = new Button()
            .setCustomId("ticket:create")
            .setLabel("Open Ticket")
            .setStyle(ButtonStyle.Primary);

        // create action row //
        const row = new ActionRow<Button>()
            .setComponents([button]);

        // send panel using components v2 flag //
        await ctx.write({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }
}