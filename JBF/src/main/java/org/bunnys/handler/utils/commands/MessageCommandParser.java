package org.bunnys.handler.utils.commands;

import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.spi.MessageCommand;

import java.util.regex.Pattern;

public class MessageCommandParser {
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

    public record ParseResult(MessageCommand command, String commandName, String[] args) {
    }

    public static ParseResult parse(JBF client, MessageReceivedEvent event) {
        String prefix = client.getConfig().prefix();
        String rawContent = event.getMessage().getContentRaw();

        if (!rawContent.startsWith(prefix))
            return null;

        String[] parts = WHITESPACE_PATTERN.split(rawContent.substring(prefix.length()).trim());

        if (parts.length == 0)
            return null; // No command found

        String commandName = parts[0];
        String[] args = parts.length > 1 ? java.util.Arrays.copyOfRange(parts, 1, parts.length) : new String[0];

        CommandRegistry.CommandEntry entry = client.commandRegistry().findMessage(commandName);

        if (entry == null)
            return null;

        return new ParseResult(entry.messageCommand(), commandName, args);
    }
}
