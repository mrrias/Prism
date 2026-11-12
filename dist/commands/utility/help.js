"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const seyfert_1 = require("seyfert");
//   command information  //
const guideContainer = new seyfert_1.Container().addComponents(new seyfert_1.TextDisplay().setContent("# Welcome to the Prism!\n\n" +
    "Here is everything you need to know to get started and navigate your way around."), new seyfert_1.TextDisplay().setContent("### Useful Channels\n" +
    "- [**Announcements:**](https://discord.com/channels/1566781855183667250/1566794245438705734) Check here for updates and news.\n" +
    "- [**Rules:**](https://discord.com/channels/1566781855183667250/1566794255928922122) Update yourself on the rules here.\n" +
    "- [**General:**](https://discord.com/channels/1566781855183667250/1568919135256191016) Our main community chat.\n" +
    "- [**Feedback & Help:**](https://discord.com/channels/1566781855183667250/1568920045747306598) Ping staff here with any feedback or questions."));
let ServerGuideCommand = class ServerGuideCommand extends seyfert_1.Command {
    async run(ctx) {
        await ctx.write({
            components: [guideContainer],
            flags: seyfert_1.MessageFlags.IsComponentsV2 | seyfert_1.MessageFlags.Ephemeral
        });
    }
};
ServerGuideCommand = __decorate([
    (0, seyfert_1.Declare)({
        name: "help",
        description: "Get a general guide for Prism."
    })
    //   command execution  //
], ServerGuideCommand);
exports.default = ServerGuideCommand;
