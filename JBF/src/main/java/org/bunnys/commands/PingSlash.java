package org.bunnys.commands;

import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.interactions.commands.OptionType;
import net.dv8tion.jda.api.interactions.commands.build.OptionData;
import net.dv8tion.jda.api.interactions.commands.build.SubcommandData;
import net.dv8tion.jda.api.interactions.commands.build.SubcommandGroupData;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.spi.SlashCommand;
import org.bunnys.handler.commands.slash.SlashCommandConfig;

public class PingSlash extends SlashCommand {

    @Override
    protected void commandOptions(SlashCommandConfig.Builder options) {
        options.name("ping")
                .description("Replies with Pong and gateway latency [Slash Test]")
                .testOnly(true)
                .addSubcommand(new SubcommandData("add", "Ban a user")
                        .addOption(OptionType.USER, "target", "User to ban", true))
                .addSubcommand(new SubcommandData("remove", "Unban a user")
                        .addOption(OptionType.USER, "target", "User to unban", true));
                //.addOption(new OptionData(OptionType.STRING, "message", "Custom message", false));
    }

    @Override
    public void execute(BunnyNexus client, SlashCommandInteractionEvent event) {
        long ping = event.getJDA().getGatewayPing();
        event.reply("🏓 Pong! Gateway ping: `" + ping + "ms`").queue();
    }
}
