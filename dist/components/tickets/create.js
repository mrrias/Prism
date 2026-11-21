"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
const types_1 = require("../../tickets/types");
//  component information  //
const ticketPermissions = seyfert_1.PermissionFlagsBits.ViewChannel |
    seyfert_1.PermissionFlagsBits.SendMessages |
    seyfert_1.PermissionFlagsBits.ReadMessageHistory |
    seyfert_1.PermissionFlagsBits.AttachFiles |
    seyfert_1.PermissionFlagsBits.EmbedLinks;
const pendingTickets = new Set();
//  modal execution  //
class CreateTicket extends seyfert_1.ModalCommand {
    customId = /^ticket:reason:(apply|report|help)$/;
    async run(ctx) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be opened in a server.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const selectedType = ctx.customId.split(":")[2];
        if (!(0, types_1.isTicketType)(selectedType)) {
            await ctx.write({
                content: "The ticket type was invalid. Please try again.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const questions = types_1.ticketQuestions[selectedType];
        const answers = questions.map(question => {
            const value = ctx.getInputValue(question.id);
            return typeof value === "string" ? value.trim() : "";
        });
        if (answers.some(answer => !answer)) {
            await ctx.write({
                content: "Please answer every question before submitting the ticket.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        if (selectedType === "report" && !/^\d{17,20}$/.test(answers[1])) {
            await ctx.write({
                content: "Enter a valid Discord user ID for the person being reported.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const answersText = questions.map((question, index) => `**${question.label}**\n${answers[index]}`).join("\n\n");
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
            const supportRoleId = process.env.SUPPORT_ROLE_ID;
            const staffRoleIds = new Set([types_1.STAFF_ROLE_ID, supportRoleId].filter((roleId) => roleId !== undefined));
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
                },
                ...Array.from(staffRoleIds, roleId => ({
                    id: roleId,
                    type: seyfert_1.OverwriteType.Role,
                    allow: (ticketPermissions | seyfert_1.PermissionFlagsBits.ManageChannels).toString()
                }))
            ];
            const username = ctx.author.username
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 20) || "user";
            const categoryId = process.env.TICKET_CATEGORY_ID;
            const ticket = await guild.channels.create({
                name: `ticket-${selectedType}-${username}-${ctx.author.id.slice(-4)}`,
                type: seyfert_1.ChannelType.GuildText,
                topic,
                permission_overwrites: overwrites,
                ...(categoryId ? { parent_id: categoryId } : {})
            });
            if (supportRoleId) {
                await ticket.messages.write({
                    content: `<@&${supportRoleId}>`,
                    allowed_mentions: {
                        parse: [],
                        roles: [supportRoleId]
                    }
                });
            }
            const closeButton = new seyfert_1.Button()
                .setCustomId(`ticket:close:${ctx.author.id}`)
                .setLabel("Close Ticket")
                .setStyle(seyfert_1.ButtonStyle.Danger);
            const row = new seyfert_1.ActionRow()
                .setComponents([closeButton]);
            const container = new seyfert_1.Container()
                .setColor(0xff99e9)
                .addComponents(new seyfert_1.TextDisplay().setContent(`### ${types_1.ticketTypeLabels[selectedType]} ticket\n` +
                `<@${ctx.author.id}> A member of the support team will be with you soon.\n\n` +
                answersText), row);
            await ticket.messages.write({
                components: [container],
                flags: seyfert_1.MessageFlags.IsComponentsV2,
                allowed_mentions: {
                    parse: []
                }
            });
            ctx.client.logger.info(`[TICKETS] Created ${selectedType} channel ${ticket.id} for user ${ctx.author.id} in guild ${ctx.guildId}`);
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
