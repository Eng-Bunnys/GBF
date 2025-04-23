package org.bunnys.handler.commands.message;

import net.dv8tion.jda.api.events.message.MessageReceivedEvent;

public abstract class MessageCommand {
    private final MessageCommandConfig options = new MessageCommandConfig();

    protected abstract void CommandOptions(MessageCommandConfig options);

    public MessageCommand() {
        CommandOptions(options);
    }

    public abstract void execute(MessageReceivedEvent message, String[] args);

    public MessageCommandConfig CommandOptions() { return this.options; }
}
