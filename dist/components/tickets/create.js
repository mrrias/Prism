"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
//  component information  //
const ticketPermissions = seyfert_1.PermissionFlagsBits.ViewChannel |
    seyfert_1.PermissionFlagsBits.SendMessages |
    seyfert_1.PermissionFlagsBits.ReadMessageHistory |
    seyfert_1.PermissionFlagsBits.AttachFiles |
    seyfert_1.PermissionFlagsBits.EmbedLinks;
const pendingTickets = new Set();
//  component execution  //
class CreateTicket extends seyfert_1.ComponentCommand {
    componentType = "Button";
    customId = "ticket:create";
    async run(ctx) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be opened in a server.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const ticketKey = `${ctx.guildId}:${ctx.author.id}`;
        if (pendingTickets.has(ticketKey)) {
            await ctx.write({
                content: "Your ticket is already being created.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        pendingTickets.add(ticketKey);
        try {
            await ctx.deferReply(true);
            const guild = await ctx.guild();
            const topic = `prism-ticket-owner:${ctx.author.id}`;
            const channels = await guild.channels.list();
            const existingTicket = channels.find(channel => "topic" in channel && channel.topic === topic);
            if (existingTicket) {
                await ctx.editOrReply({
                    content: `You already have an open ticket: <#${existingTicket.id}>`
                });
                return;
            }
            const overwrites = [
                {
                    id: ctx.guildId,
                    type: seyfert_1.OverwriteType.Role,
                    deny: seyfert_1.PermissionFlagsBits.ViewChannel.toString()
                },
                {
                    id: ctx.author.id,
                    type: seyfert_1.OverwriteType.Member,
                    allow: ticketPermissions.toString()
                },
                {
                    id: ctx.client.botId,
                    type: seyfert_1.OverwriteType.Member,
                    allow: (ticketPermissions |
                        seyfert_1.PermissionFlagsBits.ManageChannels |
                        seyfert_1.PermissionFlagsBits.MentionEveryone).toString()
                }
            ];
            const supportRoleId = process.env.SUPPORT_ROLE_ID;
            if (supportRoleId) {
                overwrites.push({
                    id: supportRoleId,
                    type: seyfert_1.OverwriteType.Role,
                    allow: (ticketPermissions | seyfert_1.PermissionFlagsBits.ManageChannels).toString()
                });
            }
            const username = ctx.author.username
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 20) || "user";
            const categoryId = process.env.TICKET_CATEGORY_ID;
            const ticket = await guild.channels.create({
                name: `ticket-${username}-${ctx.author.id.slice(-4)}`,
                type: seyfert_1.ChannelType.GuildText,
                topic,
                permission_overwrites: overwrites,
                ...(categoryId ? { parent_id: categoryId } : {})
            });
            const closeButton = new seyfert_1.Button()
                .setCustomId(`ticket:close:${ctx.author.id}`)
                .setLabel("Close Ticket")
                .setStyle(seyfert_1.ButtonStyle.Danger);
            const row = new seyfert_1.ActionRow()
                .setComponents([closeButton]);
            const supportMention = supportRoleId
                ? `<@&${supportRoleId}> `
                : "";
            const container = new seyfert_1.Container()
                .setColor(0xff99e9)
                .addComponents(new seyfert_1.TextDisplay().setContent(`### Ticket opened\n${supportMention}<@${ctx.author.id}> A member of the support team will be with you soon.`), row);
            await ticket.messages.write({
                components: [container],
                flags: seyfert_1.MessageFlags.IsComponentsV2,
                allowed_mentions: {
                    parse: [],
                    roles: supportRoleId ? [supportRoleId] : []
                }
            });
            ctx.client.logger.info(`[TICKETS] Created channel ${ticket.id} for user ${ctx.author.id} in guild ${ctx.guildId}`);
            await ctx.editOrReply({
                content: `Your ticket has been created: <#${ticket.id}>`
            });
        }
        catch (error) {
            console.error("[PRISM] Failed to create ticket:", error);
            await ctx.editOrReply({
                content: "The ticket could not be created. Please contact a server administrator."
            });
        }
        finally {
            pendingTickets.delete(ticketKey);
        }
    }
}
exports.default = CreateTicket;
