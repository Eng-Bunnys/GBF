package org.bunnys.handler.commands.message.config;

import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.bunnys.handler.GBF;

public abstract class MessageCommand {
    private final MessageCommandConfig options = new MessageCommandConfig();

    protected abstract void CommandOptions(MessageCommandConfig options);

    public MessageCommand() {
        CommandOptions(options);
    }

    public abstract void execute(GBF client, MessageReceivedEvent message, String[] args);

    public MessageCommandConfig CommandOptions() {
        return this.options;
    }
}
