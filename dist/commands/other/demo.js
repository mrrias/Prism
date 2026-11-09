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
const components = new seyfert_1.Container().addComponents(new seyfert_1.TextDisplay().setContent("Test"));
let PingCommand = class PingCommand extends seyfert_1.Command {
    async run(ctx) {
        await ctx.write({
            components: [components],
            flags: seyfert_1.MessageFlags.IsComponentsV2
        });
    }
};
PingCommand = __decorate([
    (0, seyfert_1.Declare)({
        name: "demo",
        description: "Test"
    })
    //  command execution  //
], PingCommand);
exports.default = PingCommand;
