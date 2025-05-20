package org.bunnys.handler.commands.message;

import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.config.MessageCommand;

import java.util.regex.Pattern;

public class MessageCommandParser {
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

    public record ParseResult(MessageCommand command, String commandName, String[] args) {
    }

    public static ParseResult parse(GBF client, MessageReceivedEvent event) {
        String content = event.getMessage().getContentRaw();
        String prefix = client.getConfig().Prefix();

        if (!content.startsWith(prefix))
            return null;

        String[] split = WHITESPACE_PATTERN.split(content.substring(prefix.length()), 2);
        String commandName = client.resolveCommandFromAlias(split[0]);
        MessageCommand command = client.getMessageCommand(commandName);

        if (command == null)
            return null;

        String[] args = split.length > 1 && !split[1].isBlank()
                ? WHITESPACE_PATTERN.split(split[1].trim())
                : new String[0];

        return new ParseResult(command, commandName, args);
    }
}