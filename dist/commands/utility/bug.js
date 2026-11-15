"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
//   command information   //
const options = {
    bug: (0, seyfert_1.createStringOption)({
        description: "Describe the bug you found.",
        required: true
    })
};
let BugReportCommand = class BugReportCommand extends seyfert_1.Command {
    async run(ctx) {
        const { bug } = ctx.options;
        const targetUserId = "1323481572032249933";
        try {
            const user = await ctx.client.users.fetch(targetUserId);
            await user.write({
                content: `## New Bug Report \n**From:** <@${ctx.author.id}> (${ctx.author.username})\n**Report:**\n> ${bug}`
            });
            await ctx.write({
                content: "Your bug report has been successfully sent!",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
        }
        catch (error) {
            await ctx.write({
                content: "Failed to send the bug report. Please try again later.",
                flags: seyfert_1.MessageFlags.Ephemeral
            });
        }
    }
};
BugReportCommand = __decorate([
    (0, seyfert_1.Declare)({
        name: "bug-report",
        description: "Report a bug to head developer."
    }),
    (0, seyfert_1.Options)(options)
    //   command execution   //
], BugReportCommand);
exports.default = BugReportCommand;
