"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
const messagesPerPage = 100;
async function createTranscript(ctx, channelId) {
    const messages = [];
    let before;
    while (true) {
        const page = await ctx.client.messages.list(channelId, {
            limit: messagesPerPage,
            ...(before ? { before } : {})
        });
        if (page.length === 0) {
            break;
        }
        messages.push(...page);
        before = page[page.length - 1].id;
        if (page.length < messagesPerPage) {
            break;
        }
    }
    messages.sort((left, right) => {
        const leftId = BigInt(left.id);
        const rightId = BigInt(right.id);
        return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
    });
    return messages.map(message => {
        const timestamp = message.timestamp
            ? new Date(message.timestamp).toISOString()
            : "unknown time";
        const attachments = message.attachments.map(attachment => `[Attachment: ${attachment.filename}] ${attachment.url}`);
        return [
            `[${timestamp}] ${message.author.username} (${message.author.id})`,
            message.content || "[no text content]",
            ...attachments
        ].join("\n");
    }).join("\n\n") || "No messages were found in this ticket.";
}
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
        const supportRoleId = process.env.SUPPORT_ROLE_ID;
        const isOwner = ctx.author.id === ownerId;
        const isSupport = supportRoleId !== undefined &&
            ctx.member.roles.keys.includes(supportRoleId);
        if (!isOwner && !isSupport) {
            await ctx.write({
                content: "Only the ticket owner or support team can close this ticket.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        await ctx.deferReply(true);
        let ticketClosed = false;
        let transcriptSent = false;
        try {
            const guild = await ctx.guild();
            const channel = await guild.channels.fetch(ctx.channelId);
            if (!("topic" in channel) || channel.topic !== `prism-ticket-owner:${ownerId}`) {
                await ctx.editOrReply({
                    content: "This button is not attached to its ticket channel."
                });
                return;
            }
            const logChannelId = process.env.TICKET_LOG_CHANNEL_ID;
            if (!logChannelId) {
                await ctx.editOrReply({
                    content: "Ticket logging is not configured. Ask an administrator to set TICKET_LOG_CHANNEL_ID."
                });
                return;
            }
            if (logChannelId === ctx.channelId) {
                await ctx.editOrReply({
                    content: "The ticket log channel must be separate from the ticket channel."
                });
                return;
            }
            const logChannel = await ctx.client.channels.fetch(logChannelId);
            if (logChannel.type !== seyfert_1.ChannelType.GuildText ||
                !("guildId" in logChannel) ||
                logChannel.guildId !== ctx.guildId) {
                await ctx.editOrReply({
                    content: "TICKET_LOG_CHANNEL_ID must point to a text channel in this server."
                });
                return;
            }
            const transcript = await createTranscript(ctx, ctx.channelId);
            await guild.channels.delete(ctx.channelId, `Ticket closed by ${ctx.author.username}`);
            ticketClosed = true;
            await ctx.client.messages.write(logChannelId, {
                content: `## Ticket transcript\n` +
                    `**Channel:** #${channel.name} (${ctx.channelId})\n` +
                    `**Owner ID:** ${ownerId}\n` +
                    `**Closed by:** ${ctx.author.username} (${ctx.author.id})`,
                files: [
                    new seyfert_1.AttachmentBuilder()
                        .setName(`ticket-${ctx.channelId}-transcript.txt`)
                        .setFile("buffer", Buffer.from(transcript, "utf8"))
                ]
            });
            transcriptSent = true;
            ctx.client.logger.info(`[TICKETS] Closed channel ${ctx.channelId}, sent transcript to ${logChannelId}, owner ${ownerId}, closed by ${ctx.author.id}, guild ${ctx.guildId}`);
            await ctx.editOrReply({
                content: "Your ticket has been closed."
            });
        }
        catch (error) {
            console.error("[PRISM] Failed to close ticket:", error);
            await ctx.editOrReply({
                content: ticketClosed
                    ? transcriptSent
                        ? "The ticket was closed and its transcript was logged, but confirmation failed."
                        : "The ticket was closed, but its transcript could not be sent. Please contact a server administrator."
                    : "The ticket could not be closed. Please contact a server administrator."
            });
        }
    }
}
exports.default = CloseTicket;
