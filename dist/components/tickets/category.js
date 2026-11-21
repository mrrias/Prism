"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
const types_1 = require("../../tickets/types");
//  component information  //
//  component execution  //
class SelectTicketType extends seyfert_1.ComponentCommand {
    componentType = "StringSelect";
    customId = "ticket:category";
    async run(ctx) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "Tickets can only be opened in a server.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const selectedType = ctx.interaction.values[0];
        if (!selectedType || !(0, types_1.isTicketType)(selectedType)) {
            await ctx.write({
                content: "Please choose a valid ticket type.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        const questions = types_1.ticketQuestions[selectedType].map(question => new seyfert_1.Label()
            .setLabel(question.label)
            .setComponent(new seyfert_1.TextInput()
            .setCustomId(question.id)
            .setStyle(question.style)
            .setPlaceholder(question.placeholder)
            .setLength({ min: 1, max: question.maxLength })
            .setRequired(true)));
        const modal = new seyfert_1.Modal()
            .setCustomId(`ticket:reason:${selectedType}`)
            .setTitle(`${types_1.ticketTypeLabels[selectedType]} ticket`)
            .setComponents(questions);
        await ctx.modal(modal);
    }
}
exports.default = SelectTicketType;
