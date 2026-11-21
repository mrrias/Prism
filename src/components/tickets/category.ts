import {
    ComponentCommand,
    type ComponentContext,
    Label,
    Modal,
    MessageFlags,
    TextInput
} from "seyfert";
import {
    isTicketType,
    ticketQuestions,
    ticketTypeLabels
} from "../../tickets/types";



//  component information  //



//  component execution  //

export default class SelectTicketType extends ComponentCommand {
    componentType = "StringSelect" as const;
    customId = "ticket:category";

    async run(ctx: ComponentContext<"StringSelect">) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be opened in a server.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const selectedType = ctx.interaction.values[0];
        if (!selectedType || !isTicketType(selectedType)) {
            await ctx.write({
                content: "Please choose a valid ticket type.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const questions = ticketQuestions[selectedType].map(question =>
            new Label()
                .setLabel(question.label)
                .setComponent(
                    new TextInput()
                        .setCustomId(question.id)
                        .setStyle(question.style)
                        .setPlaceholder(question.placeholder)
                        .setLength({ min: 1, max: question.maxLength })
                        .setRequired(true)
                )
        );
        const modal = new Modal()
            .setCustomId(`ticket:reason:${selectedType}`)
            .setTitle(`${ticketTypeLabels[selectedType]} ticket`)
            .setComponents(questions);

        await ctx.modal(modal);
    }
}
