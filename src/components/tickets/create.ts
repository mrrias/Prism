import {
    Button,
    ButtonStyle,
    ModalCommand,
    type ModalContext,
    ActionRow,
    Container,
    MessageFlags,
    OverwriteType,
    PermissionFlagsBits,
    TextDisplay,
    ChannelType
} from "seyfert";
import {
    isTicketType,
    STAFF_ROLE_ID,
    ticketQuestions,
    ticketTypeLabels
} from "../../tickets/types";



//  component information  //

const ticketPermissions =
    PermissionFlagsBits.ViewChannel |
    PermissionFlagsBits.SendMessages |
    PermissionFlagsBits.ReadMessageHistory |
    PermissionFlagsBits.AttachFiles |
    PermissionFlagsBits.EmbedLinks;

const pendingTickets = new Set<string>();



//  modal execution  //

export default class CreateTicket extends ModalCommand {
    customId = /^ticket:reason:(apply|report|help)$/;

    async run(ctx: ModalContext) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be opened in a server.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const selectedType = ctx.customId.split(":")[2];
        if (!isTicketType(selectedType)) {
            await ctx.write({
                content: "The ticket type was invalid. Please try again.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const questions = ticketQuestions[selectedType];
        const answers = questions.map(question => {
            const value = ctx.getInputValue(question.id);
            return typeof value === "string" ? value.trim() : "";
        });

        if (answers.some(answer => !answer)) {
            await ctx.write({
                content: "Please answer every question before submitting the ticket.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (selectedType === "report" && !/^\d{17,20}$/.test(answers[1])) {
            await ctx.write({
                content: "Enter a valid Discord user ID for the person being reported.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const answersText = questions.map((question, index) =>
            `**${question.label}**\n${answers[index]}`
        ).join("\n\n");

        const ticketKey = `${ctx.guildId}:${ctx.author.id}`;
        if (pendingTickets.has(ticketKey)) {
            await ctx.write({
                content: "Your ticket is already being created.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        pendingTickets.add(ticketKey);
        try {
            await ctx.deferReply(true);

            const guild = await ctx.guild();
            const topic = `prism-ticket-owner:${ctx.author.id}`;
            const channels = await guild.channels.list();
            const existingTicket = channels.find(
                channel => "topic" in channel && channel.topic === topic
            );

            if (existingTicket) {
                await ctx.editOrReply({
                    content: `You already have an open ticket: <#${existingTicket.id}>`
                });
                return;
            }

            const supportRoleId = process.env.SUPPORT_ROLE_ID;
            const staffRoleIds = new Set(
                [STAFF_ROLE_ID, supportRoleId].filter(
                    (roleId): roleId is string => roleId !== undefined
                )
            );
            const overwrites = [
                {
                    id: ctx.guildId,
                    type: OverwriteType.Role,
                    deny: PermissionFlagsBits.ViewChannel.toString()
                },
                {
                    id: ctx.author.id,
                    type: OverwriteType.Member,
                    allow: ticketPermissions.toString()
                },
                {
                    id: ctx.client.botId,
                    type: OverwriteType.Member,
                    allow: (
                        ticketPermissions |
                        PermissionFlagsBits.ManageChannels |
                        PermissionFlagsBits.MentionEveryone
                    ).toString()
                },
                ...Array.from(staffRoleIds, roleId => ({
                    id: roleId,
                    type: OverwriteType.Role,
                    allow: (ticketPermissions | PermissionFlagsBits.ManageChannels).toString()
                }))
            ];

            const username = ctx.author.username
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 20) || "user";
            const categoryId = process.env.TICKET_CATEGORY_ID;

            const ticket = await guild.channels.create({
                name: `ticket-${selectedType}-${username}-${ctx.author.id.slice(-4)}`,
                type: ChannelType.GuildText,
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

            const closeButton = new Button()
                .setCustomId(`ticket:close:${ctx.author.id}`)
                .setLabel("Close Ticket")
                .setStyle(ButtonStyle.Danger);
            const row = new ActionRow<Button>()
                .setComponents([closeButton]);
            const container = new Container()
                .setColor(0xff99e9)
                .addComponents(
                    new TextDisplay().setContent(
                        `### ${ticketTypeLabels[selectedType]} ticket\n` +
                        `<@${ctx.author.id}> A member of the support team will be with you soon.\n\n` +
                        answersText
                    ),
                    row
                );

            await ticket.messages.write({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                allowed_mentions: {
                    parse: []
                }
            });

            ctx.client.logger.info(
                `[TICKETS] Created ${selectedType} channel ${ticket.id} for user ${ctx.author.id} in guild ${ctx.guildId}`
            );

            await ctx.editOrReply({
                content: `Your ticket has been created: <#${ticket.id}>`
            });
        } catch (error) {
            console.error("[PRISM] Failed to create ticket:", error);
            await ctx.editOrReply({
                content: "The ticket could not be created. Please contact a server administrator."
            });
        } finally {
            pendingTickets.delete(ticketKey);
        }
    }
}
