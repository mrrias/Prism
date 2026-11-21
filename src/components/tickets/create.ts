import {
    Button,
    ButtonStyle,
    ComponentCommand,
    type ComponentContext,
    ActionRow,
    Container,
    MessageFlags,
    OverwriteType,
    PermissionFlagsBits,
    TextDisplay,
    ChannelType
} from "seyfert";



//  component information  //

const ticketPermissions =
    PermissionFlagsBits.ViewChannel |
    PermissionFlagsBits.SendMessages |
    PermissionFlagsBits.ReadMessageHistory |
    PermissionFlagsBits.AttachFiles |
    PermissionFlagsBits.EmbedLinks;

const pendingTickets = new Set<string>();



//  component execution  //

export default class CreateTicket extends ComponentCommand {
    componentType = "Button" as const;
    customId = "ticket:create";

    async run(ctx: ComponentContext<"Button">) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be opened in a server.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

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
                }
            ];

            const supportRoleId = process.env.SUPPORT_ROLE_ID;
            if (supportRoleId) {
                overwrites.push({
                    id: supportRoleId,
                    type: OverwriteType.Role,
                    allow: (ticketPermissions | PermissionFlagsBits.ManageChannels).toString()
                });
            }

            const username = ctx.author.username
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 20) || "user";
            const categoryId = process.env.TICKET_CATEGORY_ID;

            const ticket = await guild.channels.create({
                name: `ticket-${username}-${ctx.author.id.slice(-4)}`,
                type: ChannelType.GuildText,
                topic,
                permission_overwrites: overwrites,
                ...(categoryId ? { parent_id: categoryId } : {})
            });

            const closeButton = new Button()
                .setCustomId(`ticket:close:${ctx.author.id}`)
                .setLabel("Close Ticket")
                .setStyle(ButtonStyle.Danger);
            const row = new ActionRow<Button>()
                .setComponents([closeButton]);
            const supportMention = supportRoleId
                ? `<@&${supportRoleId}> `
                : "";
            const container = new Container()
                .setColor(0xff99e9)
                .addComponents(
                    new TextDisplay().setContent(
                        `### Ticket opened\n${supportMention}<@${ctx.author.id}> A member of the support team will be with you soon.`
                    ),
                    row
                );

            await ticket.messages.write({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                allowed_mentions: {
                    parse: [],
                    roles: supportRoleId ? [supportRoleId] : []
                }
            });

            ctx.client.logger.info(
                `[TICKETS] Created channel ${ticket.id} for user ${ctx.author.id} in guild ${ctx.guildId}`
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
