"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
//  command information  //
const container = new seyfert_1.Container()
    .setColor(0xff99e9)
    .addComponents(new seyfert_1.TextDisplay().setContent("### Prism Tickets \n" +
    "Open a ticket below."));
const button = new seyfert_1.Button()
    .setCustomId("ticket:create")
    .setLabel("Open Ticket")
    .setStyle(seyfert_1.ButtonStyle.Primary);
const row = new seyfert_1.ActionRow()
    .setComponents([button]);
let TicketPanel = class TicketPanel extends seyfert_1.Command {
    async onPermissionsFail(ctx) {
        await ctx.write({
            content: "Only server administrators can create the ticket panel.",
            flags: seyfert_1.MessageFlags.Ephemeral
        });
    }
    async run(ctx) {
        if (!ctx.inGuild()) {
            await ctx.write({
                content: "The ticket panel can only be created in a server.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        if (!ctx.member.permissions.has(seyfert_1.PermissionFlagsBits.Administrator)) {
            await ctx.write({
                content: "Only server administrators can create the ticket panel.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
            return;
        }
        await ctx.deferReply(true);
        try {
            await ctx.client.messages.write(ctx.channelId, {
                components: [container, row],
                flags: seyfert_1.MessageFlags.IsComponentsV2
            });
            ctx.client.logger.info(`[TICKETS] Panel posted in channel ${ctx.channelId} by user ${ctx.author.id} in guild ${ctx.guildId}`);
            await ctx.deleteResponse();
        }
        catch (error) {
            console.error("[PRISM] Failed to post ticket panel:", error);
            await ctx.editOrReply({
                content: "The ticket panel could not be posted. Please try again or contact a server administrator."
            });
        }
    }
};
TicketPanel = __decorate([
    (0, seyfert_1.Declare)({
        name: "panel",
        description: "Create the support ticket panel",
        defaultMemberPermissions: ["Administrator"]
    })
    //  command execution  //
], TicketPanel);
exports.default = TicketPanel;
