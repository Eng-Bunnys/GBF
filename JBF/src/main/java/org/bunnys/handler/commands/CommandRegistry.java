package org.bunnys.handler.commands;

import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.utils.Logger;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class CommandRegistry {
    private final ConcurrentHashMap<String, CommandEntry> merged = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
    // To-Do: Slash Commands map

    private static String canonical(String name) {
        return name.toLowerCase(Locale.US).trim();
    }

    /**
     * Register a message command and all aliases, if name already exists, we throw
     * an error
     * User lower-case canonical names for O(1) lookups
     */
    public void registerMessageCommand(MessageCommand cmd, MessageCommandConfig cfg) {
        String canonical = canonical(cfg.commandName());

        this.messageCommands.putIfAbsent(canonical, cmd);
        this.merged.putIfAbsent(canonical, CommandEntry.forMessage(cmd, cfg));

        for (String alias : cfg.aliases()) {
            String aliasCanonical = canonical(alias);
            this.messageCommands.putIfAbsent(aliasCanonical, cmd);
            this.merged.putIfAbsent(aliasCanonical, CommandEntry.forMessage(cmd, cfg));
        }

        Logger.debug(() -> "[CommandRegistry] Registered message command: " + cfg.commandName() +
                (cfg.aliases().isEmpty() ? "" : " with aliases: " + String.join(", ", cfg.aliases())));
    }

    public CommandEntry findMerged(String token) {
        if (token == null || token.isBlank())
            return null;
        return this.merged.get(canonical(token));
    }

    // Views
    public Map<String, MessageCommand> messageView() {
        return Map.copyOf(this.messageCommands);
    }

    public Map<String, CommandEntry> mergedView() {
        return Map.copyOf(this.merged);
    }

    /** Descriptor for merged lookup */
    public static final class CommandEntry {
        public enum CommandType {
            MESSAGE, SLASH
        } // To-Do: Add context menu and user command support

        private final CommandType type;
        private final MessageCommand messageCommand;
        private final MessageCommandConfig messageMetaData;

        // To-Do: Slash Commands

        private CommandEntry(CommandType type, MessageCommand messageCommand, MessageCommandConfig messageMetaData) {
            this.type = type;
            this.messageCommand = messageCommand;
            this.messageMetaData = messageMetaData;
        }

        public static CommandEntry forMessage(MessageCommand cmd, MessageCommandConfig meta) {
            return new CommandEntry(CommandType.MESSAGE, cmd, meta);
        }

        // To-Do: forSlash

        public CommandType type() {
            return this.type;
        }

        public MessageCommand messageCommand() {
            return this.messageCommand;
        }

        public MessageCommandConfig messageMetaData() {
            return this.messageMetaData;
        }
    }
}
