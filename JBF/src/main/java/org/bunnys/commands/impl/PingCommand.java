package org.bunnys.commands.impl;

import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.commands.message.MessageCommandConfig;

public class PingCommand extends MessageCommand {
    @Override
    protected void commandOptions(MessageCommandConfig.Builder options) {
        options.name("ping")
                .description("Replies with Pong and gateway latency")
                .usage("ping")
                .aliases("p", "latency")
                .devOnly(true)
                .NSFW(true);
        // .cooldown(20);
        // .botPermissions(Permission.ADMINISTRATOR);
        // .userPermissions(Permission.BAN_MEMBERS, Permission.MANAGE_PERMISSIONS);
    }

    @Override
    public void execute(JBF client, MessageReceivedEvent message, String[] args) {
        long ping = message.getJDA().getGatewayPing();
        message.getMessage().reply("Ping: `" + ping + "ms`").queue();
    }
}
