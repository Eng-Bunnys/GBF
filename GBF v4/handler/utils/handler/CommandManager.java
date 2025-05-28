package org.bunnys.handler.utils.handler;

import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.CommandLoader;
import org.bunnys.handler.commands.message.config.MessageCommand;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.Logger;

import java.util.Arrays;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class CommandManager {
    private static final int DEFAULT_TIMEOUT_SECONDS = 5;
    private final Config config;

    private final ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> aliases = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> aliasToCommandMap = new ConcurrentHashMap<>();
    private final CompletableFuture<Void> commandsLoadedFuture = new CompletableFuture<>();

    public CommandManager(Config config) {
        this.config = config;
    }

    public CompletableFuture<Void> registerCommandsAsync() {
        long start = System.currentTimeMillis();

        if (config.CommandsFolder() == null || config.CommandsFolder().isBlank()) {
            Logger.warning("Commands folder not specified. Skipping command registration.");
            commandsLoadedFuture.complete(null);
            return CompletableFuture.completedFuture(null);
        }

        return CompletableFuture.supplyAsync(() -> CommandLoader.loadCommands(config.CommandsFolder(), config), GBF.SHARED_POOL)
                .thenCompose(commands -> {
                    CompletableFuture<?>[] futures = commands.entrySet().stream()
                            .map(entry -> CompletableFuture.runAsync(() -> {
                                        messageCommands.put(entry.getKey(), entry.getValue());
                                    }, GBF.SHARED_POOL)
                                    .orTimeout(config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS), TimeUnit.SECONDS)
                                    .exceptionally(throwable -> {
                                        Logger.error("Failed to load command " + entry.getKey() + ": " + throwable.getMessage());
                                        return null;
                                    }))
                            .toArray(CompletableFuture[]::new);
                    return CompletableFuture.allOf(futures);
                })
                .thenRun(() -> {
                    commandsLoadedFuture.complete(null);
                    if (config.LogActions())
                        Logger.success("Loaded " + messageCommands.size() + " commands in " +
                                (System.currentTimeMillis() - start) + "ms");
                })
                .exceptionally(throwable -> {
                    Logger.error("Command loading failed: " + throwable.getMessage());
                    commandsLoadedFuture.completeExceptionally(throwable);
                    return null;
                });
    }

    public CompletableFuture<MessageCommand> getMessageCommand(String name) {
        if (name == null || name.isBlank()) {
            Logger.warning("Command name cannot be null or blank.");
            return CompletableFuture.completedFuture(null);
        }

        return commandsLoadedFuture
                .orTimeout(config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS), TimeUnit.SECONDS)
                .thenApplyAsync(__ -> messageCommands.get(name), GBF.SHARED_POOL)
                .exceptionally(throwable -> {
                    Logger.error("Command loading timed out or failed: " + throwable.getMessage());
                    return null;
                });
    }

    public void setAlias(String commandName, String[] aliases) {
        if (commandName == null || commandName.isBlank() || aliases == null)
            throw new IllegalArgumentException("Command name and aliases cannot be null or blank");

        if (this.aliases.containsKey(commandName))
            throw new IllegalStateException("Command name already exists: " + commandName);

        Set<String> aliasSet = Set.copyOf(Arrays.asList(aliases));
        this.aliases.put(commandName, aliasSet);
        for (String alias : aliasSet) {
            if (alias == null || alias.isBlank()) {
                Logger.warning("Skipping invalid alias for command: " + commandName);
                continue;
            }
            String existing = aliasToCommandMap.putIfAbsent(alias, commandName);

            if (existing != null)
                throw new IllegalStateException("Duplicate alias detected: '" + alias +
                        "' for command " + commandName + " (already used by " + existing + ")");
        }
    }

    public String resolveCommandFromAlias(String alias) {
        return alias == null || alias.isBlank() ? null : aliasToCommandMap.getOrDefault(alias, alias);
    }

    public void clearCommands() {
        messageCommands.clear();
        aliases.clear();
        aliasToCommandMap.clear();
        commandsLoadedFuture.complete(null);
    }
}