package org.bunnys.handler.commands;

import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.commands.slash.SlashCommandConfig;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.spi.SlashCommand;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe command registry
 * - Registration is synchronized to guarantee atomicity of name + alias inserts
 * - Duplicate names/aliases will raise IllegalStateException (deterministic -
 * fail fast)
 */
public class CommandRegistry {
    private final ConcurrentHashMap<String, CommandEntry> merged = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SlashCommand> slashCommands = new ConcurrentHashMap<>();

    private static String canonical(String name) {
        if (name == null)
            return "";
        return name.toLowerCase(Locale.ROOT).trim();
    }

    /**
     * Register a message command and all aliases. This operation is atomic:
     * either all keys (name + aliases) are inserted, or none are and an exception
     * is thrown
     *
     * @throws IllegalStateException when a name / alias conflict exists
     */
    public void registerMessageCommand(MessageCommand cmd, MessageCommandConfig cfg) {
        Objects.requireNonNull(cmd, "cmd");
        Objects.requireNonNull(cfg, "cfg");

        String canonicalName = canonical(cfg.commandName());
        if (canonicalName.isBlank())
            throw new IllegalArgumentException("Command name cannot be blank");

        // Build set of all keys to insert
        Set<String> keysToInsert = new LinkedHashSet<>();
        keysToInsert.add(canonicalName);

        for (String alias : cfg.aliases()) {
            String a = canonical(alias);
            if (a.isBlank())
                continue; // ignore blank aliases
            keysToInsert.add(a);
        }

        CommandEntry entry = CommandEntry.forMessage(cmd, cfg);

        // Atomicity: synchronize the whole registration so we can check for conflicts
        // and then insert
        synchronized (this) {
            // Check conflicts
            List<String> conflicts = new ArrayList<>();
            for (String key : keysToInsert)
                if (this.messageCommands.containsKey(key))
                    conflicts.add(key);

            if (!conflicts.isEmpty()) {
                String firstConflict = conflicts.getFirst();
                String msg = "[CommandRegistry] Duplicate command key detected: " + firstConflict +
                        " (attempted to register " + cfg.commandName() + " / aliases=" + cfg.aliases() + ")";
                Logger.error(msg);
                throw new IllegalStateException(msg);
            }

            // Insert into maps
            this.messageCommands.put(canonicalName, cmd);
            this.merged.put(canonicalName, entry);

            for (String key : keysToInsert) {
                if (key.equals(canonicalName))
                    continue; // already inserted
                this.messageCommands.putIfAbsent(key, cmd);
                this.merged.putIfAbsent(key, entry);
            }
        }

        Logger.debug(() -> "[CommandRegistry] Registered message command: " + cfg.commandName()
                + (cfg.aliases().isEmpty() ? "" : " with aliases: " + String.join(", ", cfg.aliases())));
    }

    public void registerSlashCommand(SlashCommand cmd, SlashCommandConfig cfg) {
        Objects.requireNonNull(cmd, "cmd");
        Objects.requireNonNull(cfg, "cfg");

        String canonicalName = canonical(cfg.name());

        if (canonicalName.isBlank())
            throw new IllegalArgumentException("Slash Command name cannot be blank");

        CommandEntry entry = CommandEntry.forSlash(cmd, cfg);

        synchronized (this) {
            if (this.slashCommands.containsKey(canonicalName)) {
                //TODO: Handle dupes
                throw new IllegalStateException("Duped slash command " + canonicalName);
            }

            this.slashCommands.put(canonicalName, cmd);
            this.merged.put(canonicalName, entry);
        }

        Logger.debug(() -> "[CommandRegistry] Registered Slash Commands: " + cfg.name());
    }

    public CommandEntry findMerged(String token) {
        if (token == null || token.isBlank())
            return null;
        return this.merged.get(canonical(token));
    }

    public CommandEntry findMessage(String token) {
        if (token == null || token.isBlank())
            return null;

        CommandEntry entry = this.merged.get(canonical(token));
        if (entry == null || entry.type() != CommandEntry.CommandType.MESSAGE)
            return null;

        return entry;
    }

    //TODO: Find slash fn

    // Views
    public Map<String, MessageCommand> messageView() {
        return Collections.unmodifiableMap(this.messageCommands);
    }

    public Map<String, SlashCommand> slashView() {
        return Collections.unmodifiableMap(this.slashCommands);
    }

    public Map<String, CommandEntry> mergedView() {
        return Collections.unmodifiableMap(this.merged);
    }

    /**
     * Descriptor for merged lookup
     */
        public record CommandEntry(CommandType type, MessageCommand messageCommand, MessageCommandConfig messageMetaData,
                                   SlashCommand slashCommand, SlashCommandConfig slashMetaData) {
            public enum CommandType {
                MESSAGE, SLASH
            }

        public static CommandEntry forMessage(MessageCommand cmd, MessageCommandConfig meta) {
                return new CommandEntry(CommandType.MESSAGE, cmd, meta, null, null);
            }

            public static CommandEntry forSlash(SlashCommand cmd, SlashCommandConfig meta) {
                return new CommandEntry(CommandType.SLASH, null, null, cmd, meta);
            }
        }
}
