package org.bunnys.commands;

import net.dv8tion.jda.api.events.message.MessageReceivedEvent;

import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.MessageCommand;
import org.bunnys.handler.commands.message.MessageCommandConfig;

public class PingCommand extends MessageCommand {

    @Override
    protected void CommandOptions(MessageCommandConfig options) {
        options
                .setName("ping")
                .setDescription("Replies with Pong!");
    }

    @Override
    public void execute(GBF client, MessageReceivedEvent message, String[] args) {
        message.getMessage().reply("Pong!").queue();
    }
}
