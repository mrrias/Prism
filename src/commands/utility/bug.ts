import {
    Declare,
    Command,
    type CommandContext,
    Options,
    createStringOption,
    MessageFlags
} from "seyfert";



//   command information   //

const options = {
    bug: createStringOption({
        description: "Describe the bug you found.",
        required: true
    })
};

@Declare({
    name: "bug-report",
    description: "Report a bug to head developer."
})
@Options(options)



//   command execution   //

export default class BugReportCommand extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const { bug } = ctx.options;
        const targetUserId = "1323481572032249933";

        try {
            const user = await ctx.client.users.fetch(targetUserId);
            await user.write({
                content: `## New Bug Report \n**From:** <@${ctx.author.id}> (${ctx.author.username})\n**Report:**\n> ${bug}`
            });

            await ctx.write({
                content: "Your bug report has been successfully sent!",
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            await ctx.write({
                content: "Failed to send the bug report. Please try again later.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
}