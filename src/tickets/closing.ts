import {
    AttachmentBuilder,
    ChannelType,
    type GuildStructure,
    type UsingClient
} from "seyfert";

const messagesPerPage = 100;
const ticketOwnerPrefix = "prism-ticket-owner:";

export type TicketClosePreparation =
    | {
        valid: true;
        ownerId: string;
        channelName: string;
        logChannelId: string;
        transcript: string;
    }
    | {
        valid: false;
        message: string;
    };

async function createTranscript(client: UsingClient, channelId: string) {
    const messages = [];
    let before: string | undefined;

    while (true) {
        const page = await client.messages.list(channelId, {
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
        const attachments = message.attachments.map(
            attachment => `[Attachment: ${attachment.filename}] ${attachment.url}`
        );

        return [
            `[${timestamp}] ${message.author.username} (${message.author.id})`,
            message.content || "[no text content]",
            ...attachments
        ].join("\n");
    }).join("\n\n") || "No messages were found in this ticket.";
}

export async function prepareTicketClose(
    client: UsingClient,
    guild: GuildStructure<"api" | "cached">,
    channelId: string
): Promise<TicketClosePreparation> {
    const channel = await guild.channels.fetch(channelId);
    if (
        !("topic" in channel) ||
        typeof channel.topic !== "string" ||
        !channel.topic.startsWith(ticketOwnerPrefix)
    ) {
        return {
            valid: false,
            message: "This channel is not an open ticket."
        };
    }

    const ownerId = channel.topic.slice(ticketOwnerPrefix.length);
    if (!/^\d+$/.test(ownerId)) {
        return {
            valid: false,
            message: "This channel has invalid ticket details."
        };
    }

    const logChannelId = process.env.TICKET_LOG_CHANNEL_ID;
    if (!logChannelId) {
        return {
            valid: false,
            message: "Ticket logging is not configured. Ask an administrator to set TICKET_LOG_CHANNEL_ID."
        };
    }

    if (logChannelId === channelId) {
        return {
            valid: false,
            message: "The ticket log channel must be separate from the ticket channel."
        };
    }

    const logChannel = await client.channels.fetch(logChannelId);
    if (
        logChannel.type !== ChannelType.GuildText ||
        !("guildId" in logChannel) ||
        logChannel.guildId !== guild.id
    ) {
        return {
            valid: false,
            message: "TICKET_LOG_CHANNEL_ID must point to a text channel in this server."
        };
    }

    return {
        valid: true,
        ownerId,
        channelName: channel.name ?? channelId,
        logChannelId,
        transcript: await createTranscript(client, channelId)
    };
}

export async function sendTicketTranscript(
    client: UsingClient,
    channelId: string,
    ticket: Extract<TicketClosePreparation, { valid: true }>,
    closer: { id: string; username: string }
) {
    await client.messages.write(ticket.logChannelId, {
        content:
            `## Ticket transcript\n` +
            `**Channel:** #${ticket.channelName} (${channelId})\n` +
            `**Owner ID:** ${ticket.ownerId}\n` +
            `**Closed by:** ${closer.username} (${closer.id})`,
        files: [
            new AttachmentBuilder()
                .setName(`ticket-${channelId}-transcript.txt`)
                .setFile("buffer", Buffer.from(ticket.transcript, "utf8"))
        ]
    });
}
