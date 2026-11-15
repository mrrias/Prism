"use strict";
// AI assistance
// needs to be reviewed and properly edited
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
let TicketPanel = class TicketPanel extends seyfert_1.Command {
    async run(ctx) {
        // create components v2 container //
        const container = new seyfert_1.Container().addComponents(new seyfert_1.TextDisplay().setContent("### Prism Tickets\nOpen a ticket by clicking below."));
        // create button //
        const button = new seyfert_1.Button()
            .setCustomId("ticket:create")
            .setLabel("Open Ticket")
            .setStyle(seyfert_1.ButtonStyle.Primary);
        // create action row //
        const row = new seyfert_1.ActionRow()
            .setComponents([button]);
        // send panel using components v2 flag //
        await ctx.write({
            components: [container, row],
            flags: seyfert_1.MessageFlags.IsComponentsV2
        });
    }
};
TicketPanel = __decorate([
    (0, seyfert_1.Declare)({
        name: "panel",
        description: "Create the support ticket panel"
    })
], TicketPanel);
exports.default = TicketPanel;
