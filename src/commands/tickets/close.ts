import {
    Command,
    Declare,
    MessageFlags,
    PermissionFlagsBits,
    type CommandContext
} from "seyfert";
import { prepareTicketClose, sendTicketTranscript } from "../../tickets/closing";
import { STAFF_ROLE_ID } from "../../tickets/types";



//  command information  //

@Declare({
    name: "close",
    description: "Close this ticket"
})



//  command execution  //

export default class CloseTicketCommand extends Command {
    async run(ctx: CommandContext) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be closed in a server.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const isStaff = ctx.member.roles.keys.includes(STAFF_ROLE_ID);
        const isAdministrator = ctx.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff && !isAdministrator) {
            await ctx.write({
                content: "Only members with the Staff role or Administrator permission can close tickets.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await ctx.deferReply(true);
        let ticketClosed = false;
        let transcriptSent = false;

        try {
            const guild = await ctx.guild();
            const ticket = await prepareTicketClose(ctx.client, guild, ctx.channelId);
            if (!ticket.valid) {
                await ctx.editOrReply({
                    content: ticket.message
                });
                return;
            }

            await ctx.editOrReply({
                content: "Closing this ticket and saving its transcript."
            });
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

            await ctx.editOrReply({
                content: "The ticket could not be closed. Please contact a server administrator."
            });
        }
    }
}
