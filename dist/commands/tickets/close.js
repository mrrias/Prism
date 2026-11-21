"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
const closing_1 = require("../../tickets/closing");
const types_1 = require("../../tickets/types");
//  command information  //
let CloseTicketCommand = class CloseTicketCommand extends seyfert_1.Command {
    async run(ctx) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be closed in a server.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const isStaff = ctx.member.roles.keys.includes(types_1.STAFF_ROLE_ID);
        const isAdministrator = ctx.member.permissions.has(seyfert_1.PermissionFlagsBits.Administrator);
        if (!isStaff && !isAdministrator) {
            await ctx.write({
                content: "Only members with the Staff role or Administrator permission can close tickets.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        await ctx.deferReply(true);
        let ticketClosed = false;
        let transcriptSent = false;
        try {
            const guild = await ctx.guild();
            const ticket = await (0, closing_1.prepareTicketClose)(ctx.client, guild, ctx.channelId);
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
            await ctx.editOrReply({
                content: "The ticket could not be closed. Please contact a server administrator."
            });
        }
    }
};
CloseTicketCommand = __decorate([
    (0, seyfert_1.Declare)({
        name: "close",
        description: "Close this ticket"
    })
    //  command execution  //
], CloseTicketCommand);
exports.default = CloseTicketCommand;
