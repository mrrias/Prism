import {
    Declare,
    Command,
    MessageFlags,
    type CommandContext,
    Container,
    TextDisplay,
    ActionRow,
    StringSelectMenu,
    PermissionFlagsBits,
} from "seyfert";
import { ticketTypeLabels } from "../../tickets/types";



//  command information  //

const container = new Container()
.setColor(0xff99e9)
.addComponents(
    new TextDisplay().setContent(
        "### Prism Tickets \n" +
        "Choose a ticket type below to get started."
    )
);

const selectMenu = new StringSelectMenu()
    .setCustomId("ticket:category")
    .setPlaceholder("Choose a ticket type")
    .setValuesLength({ min: 1, max: 1 })
    .setOptions(
        Object.entries(ticketTypeLabels).map(([value, label]) => ({
            label,
            value,
            description: `${label} support`
        }))
    );

const row = new ActionRow<StringSelectMenu>()
    .setComponents([selectMenu]);


@Declare({
    name: "panel",
    description: "Create the support ticket panel",
    defaultMemberPermissions: ["Administrator"]
})



//  command execution  //

export default class TicketPanel extends Command {
    async onPermissionsFail(ctx: CommandContext) {
        await ctx.write({
            content: "Only server administrators can create the ticket panel.",
            flags: MessageFlags.Ephemeral
        });
    }

    async run(ctx: CommandContext) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "The ticket panel can only be created in a server.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (!ctx.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await ctx.write({
                content: "Only server administrators can create the ticket panel.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await ctx.deferReply(true);

        try {
            await ctx.client.messages.write(ctx.channelId, {
                components: [container, row],
                flags: MessageFlags.IsComponentsV2
            });

            ctx.client.logger.info(
                `[TICKETS] Panel posted in channel ${ctx.channelId} by user ${ctx.author.id} in guild ${ctx.guildId}`
            );

            await ctx.deleteResponse();
        } catch (error) {
            console.error("[PRISM] Failed to post ticket panel:", error);
            await ctx.editOrReply({
                content: "The ticket panel could not be posted. Please try again or contact a server administrator."
            });
        }
    }
}