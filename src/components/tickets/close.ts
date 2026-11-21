import {
    ComponentCommand,
    type ComponentContext,
    MessageFlags,
    PermissionFlagsBits
} from "seyfert";
import { prepareTicketClose, sendTicketTranscript } from "../../tickets/closing";
import { STAFF_ROLE_ID } from "../../tickets/types";

//  component execution  //

export default class CloseTicket extends ComponentCommand {
    componentType = "Button" as const;
    customId = /^ticket:close:\d+$/;

    async run(ctx: ComponentContext<"Button">) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "This ticket can only be closed in a server.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const ownerId = ctx.customId.split(":")[2];
        const isStaff = ctx.member.roles.keys.includes(STAFF_ROLE_ID);
        const isAdministrator = ctx.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff && !isAdministrator) {
            await ctx.write({
                content: "Only members with the Staff role or Administrator permission can close tickets.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await ctx.deferUpdate();
        let ticketClosed = false;
        let transcriptSent = false;

        try {
            const guild = await ctx.guild();
            const ticket = await prepareTicketClose(ctx.client, guild, ctx.channelId);
            if (!ticket.valid) {
                await ctx.followup({
                    content: ticket.message,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            if (ticket.ownerId !== ownerId) {
                await ctx.followup({
                    content: "This button does not belong to this ticket.",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            await guild.channels.delete(ctx.channelId, `Ticket closed by ${ctx.author.username}`);
            ticketClosed = true;

            await sendTicketTranscript(ctx.client, ctx.channelId, ticket, ctx.author);
            transcriptSent = true;

            ctx.client.logger.info(
                `[TICKETS] Closed channel ${ctx.channelId}, sent transcript to ${ticket.logChannelId}, owner ${ticket.ownerId}, closed by ${ctx.author.id}, guild ${ctx.guildId}`
            );
        } catch (error) {
            console.error("[PRISM] Failed to close ticket:", error);

            if (ticketClosed) {
                if (!transcriptSent) {
                    ctx.client.logger.error(
                        `[TICKETS] Channel ${ctx.channelId} was closed but its transcript was not sent.`
                    );
                }
                return;
            }

            await ctx.followup({
                content: "The ticket could not be closed. Please contact a server administrator.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
