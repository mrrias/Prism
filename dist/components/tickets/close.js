"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
const closing_1 = require("../../tickets/closing");
const types_1 = require("../../tickets/types");
//  component execution  //
class CloseTicket extends seyfert_1.ComponentCommand {
    componentType = "Button";
    customId = /^ticket:close:\d+$/;
    async run(ctx) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "This ticket can only be closed in a server.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const ownerId = ctx.customId.split(":")[2];
        const isStaff = ctx.member.roles.keys.includes(types_1.STAFF_ROLE_ID);
        const isAdministrator = ctx.member.permissions.has(seyfert_1.PermissionFlagsBits.Administrator);
        if (!isStaff && !isAdministrator) {
            await ctx.write({
                content: "Only members with the Staff role or Administrator permission can close tickets.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        await ctx.deferUpdate();
        let ticketClosed = false;
        let transcriptSent = false;
        try {
            const guild = await ctx.guild();
            const ticket = await (0, closing_1.prepareTicketClose)(ctx.client, guild, ctx.channelId);
            if (!ticket.valid) {
                await ctx.followup({
                    content: ticket.message,
                    flags: seyfert_1.MessageFlags.Ephemeral
                });
                return;
            }
            if (ticket.ownerId !== ownerId) {
                await ctx.followup({
                    content: "This button does not belong to this ticket.",
                    flags: seyfert_1.MessageFlags.Ephemeral
                });
                return;
            }
            await guild.channels.delete(ctx.channelId, `Ticket closed by ${ctx.author.username}`);
            ticketClosed = true;
            await (0, closing_1.sendTicketTranscript)(ctx.client, ctx.channelId, ticket, ctx.author);
            transcriptSent = true;
            ctx.client.logger.info(`[TICKETS] Closed channel ${ctx.channelId}, sent transcript to ${ticket.logChannelId}, owner ${ticket.ownerId}, closed by ${ctx.author.id}, guild ${ctx.guildId}`);
        }
        catch (error) {
            console.error("[PRISM] Failed to close ticket:", error);
            if (ticketClosed) {
                if (!transcriptSent) {
                    ctx.client.logger.error(`[TICKETS] Channel ${ctx.channelId} was closed but its transcript was not sent.`);
                }
                return;
            }
            await ctx.followup({
                content: "The ticket could not be closed. Please contact a server administrator.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
        }
    }
}
exports.default = CloseTicket;
