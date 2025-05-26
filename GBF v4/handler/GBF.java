package org.bunnys.handler;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import org.bunnys.handler.commands.CommandLoader;
import org.bunnys.handler.commands.message.config.MessageCommand;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.utils.EnvLoader;
import org.bunnys.handler.utils.Logger;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * GBF Handler v4.1
 * Optimized Discord bot framework with asynchronous loading, parallel processing, and improved resource management.
 * Written by Bunnys, optimized by Grok
 */
public class GBF {
    private static final int DEFAULT_TIMEOUT_SECONDS = 10;
    private static final int DEFAULT_RETRIES = 3;
    public static final ForkJoinPool SHARED_POOL = new ForkJoinPool(
            Math.max(4, Runtime.getRuntime().availableProcessors() * 2),
            ForkJoinPool.defaultForkJoinWorkerThreadFactory,
            (pool, throwable) -> Logger.error("Uncaught exception in thread pool: " + throwable.getMessage()),
            true
    );

    private final Config config;
    private static volatile GBF client;
    private static volatile JDA jda;

    private final boolean loadEvents;
    private final boolean loadHandlerEvents;
    private final AtomicInteger eventCount = new AtomicInteger(0);
    private final ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> aliases = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> aliasToCommandMap = new ConcurrentHashMap<>();
    private volatile boolean commandsLoaded = false;

    private final long startTime = System.currentTimeMillis();

    public GBF(Config config) {
        if (config == null) throw new IllegalArgumentException("Config cannot be null");
        this.config = config;

        String token = config.token() != null && !config.token().isBlank()
                ? config.token()
                : EnvLoader.get("TOKEN");
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Bot token is not specified in config or environment.");
        }
        this.config.token(token);

        synchronized (GBF.class) {
            if (client != null) throw new IllegalStateException("GBF instance already exists");
            client = this;
        }

        this.loadEvents = config.EventFolder() != null && !config.EventFolder().isBlank() && !config.IgnoreEvents();
        this.loadHandlerEvents = !config.IgnoreEventsFromHandler();

        if (config.AutoLogin()) {
            try {
                login();
            } catch (InterruptedException e) {
                Logger.error("Login interrupted: " + e.getMessage());
                Thread.currentThread().interrupt();
            }
        }
    }

    private void registerCommandsAsync() {
        long start = System.currentTimeMillis();
        if (config.CommandsFolder() == null || config.CommandsFolder().isBlank()) {
            Logger.warning("Commands folder not specified. Skipping command registration.");
            commandsLoaded = true;
            return;
        }

        CompletableFuture.supplyAsync(() -> CommandLoader.loadCommands(config.CommandsFolder(), config), SHARED_POOL)
                .orTimeout(config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS), TimeUnit.SECONDS)
                .whenComplete((commands, throwable) -> {
                    if (throwable != null) {
                        Logger.error("Command loading failed: " + throwable.getMessage());
                        commandsLoaded = true;
                        return;
                    }
                    messageCommands.putAll(commands);
                    commandsLoaded = true;
                    if (config.LogActions()) {
                        Logger.success("Loaded " + messageCommands.size() + " commands in " +
                                (System.currentTimeMillis() - start) + "ms");
                    }
                })
                .exceptionally(throwable -> {
                    Logger.error("Command loading timed out or failed: " + throwable.getMessage());
                    commandsLoaded = true;
                    return null;
                });
    }

    private void registerEvents(JDA builder) {
        long start = System.currentTimeMillis();
        CompletableFuture<Void> handlerEventsFuture = CompletableFuture.completedFuture(null);
        CompletableFuture<Void> customEventsFuture = CompletableFuture.completedFuture(null);

        if (loadHandlerEvents) {
            handlerEventsFuture = loadAndRegisterEvents("org.bunnys.handler.events.defaults", builder);
        }
        if (loadEvents) {
            customEventsFuture = loadAndRegisterEvents(config.EventFolder(), builder);
        }

        CompletableFuture.allOf(handlerEventsFuture, customEventsFuture)
                .orTimeout(config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS), TimeUnit.SECONDS)
                .whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        Logger.error("Event registration failed: " + throwable.getMessage());
                    } else if (config.LogActions()) {
                        Logger.success("Loaded " + eventCount.get() + " events in " +
                                (System.currentTimeMillis() - start) + "ms");
                    }
                })
                .join();
    }

    private CompletableFuture<Void> loadAndRegisterEvents(String packageName, JDA builder) {
        return CompletableFuture.supplyAsync(() -> EventLoader.loadEvents(packageName), SHARED_POOL)
                .thenAcceptAsync(events -> events.forEach(event -> {
                    try {
                        long eventStart = System.nanoTime();
                        event.register(builder);
                        long eventEnd = System.nanoTime();
                        if (config.LogActions() && (eventEnd - eventStart) / 1_000_000 > 1) {
                            Logger.warning("Slow event registration for " + event.getClass().getSimpleName() +
                                    ": " + (eventEnd - eventStart) / 1_000_000 + "ms");
                        }
                        eventCount.incrementAndGet();
                    } catch (Exception e) {
                        Logger.error("Failed to register event " + event.getClass().getName() + ": " + e.getMessage());
                    }
                }), SHARED_POOL);
    }

    public void login() throws InterruptedException {
        long jdaStart = System.currentTimeMillis();
        List<GatewayIntent> intents = config.intents().isEmpty()
                ? Arrays.asList(GatewayIntent.GUILD_MESSAGES, GatewayIntent.DIRECT_MESSAGES)
                : config.intents();

        for (int i = 0; i < config.getRetries(DEFAULT_RETRIES); i++) {
            try {
                jda = JDABuilder.create(config.token(), intents)
                        .setMemberCachePolicy(MemberCachePolicy.DEFAULT)
                        .setChunkingFilter(ChunkingFilter.NONE)
                        .build();
                break;
            } catch (Exception e) {
                if (i == config.getRetries(DEFAULT_RETRIES) - 1) {
                    throw new RuntimeException("Failed to initialize JDA after " + config.getRetries(DEFAULT_RETRIES) + " attempts", e);
                }
                Logger.warning("JDA initialization failed, retrying (" + (i + 1) + "/" + config.getRetries(DEFAULT_RETRIES) + "): " + e.getMessage());
                Thread.sleep(1000);
            }
        }

        if (config.LogActions()) {
            Logger.info("JDA initialization took " + (System.currentTimeMillis() - jdaStart) + "ms");
        }

        CompletableFuture<Void> eventRegistration = CompletableFuture.runAsync(() -> {
            registerEvents(jda);
            registerCommandsAsync();
        }, SHARED_POOL);

        CompletableFuture<Void> botReady = CompletableFuture.runAsync(() -> {
            try {
                jda.awaitReady();
                if (config.LogActions()) {
                    Logger.success("GBF Handler v4.1 is ready! Took " + (System.currentTimeMillis() - startTime) + "ms to load");
                }
            } catch (InterruptedException e) {
                Logger.error("Error waiting for bot to be ready: " + e.getMessage());
                Thread.currentThread().interrupt();
            }
        }, SHARED_POOL);

        CompletableFuture.allOf(eventRegistration, botReady).join();
    }

    public static GBF getClient() {
        return client;
    }

    public Config getConfig() {
        return config;
    }

    public static JDA getJDA() {
        return jda;
    }

    public static String getHandlerVersion() {
        return "4.1.0";
    }

    public MessageCommand getMessageCommand(String name) {
        if (name == null || name.isBlank()) {
            Logger.warning("Command name cannot be null or blank.");
            return null;
        }
        if (!commandsLoaded) {
            long startWait = System.currentTimeMillis();
            while (!commandsLoaded && (System.currentTimeMillis() - startWait) < config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS) * 1000) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Logger.error("Interrupted while waiting for commands to load: " + e.getMessage());
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
            if (!commandsLoaded) {
                Logger.error("Command loading timed out after " + config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS) + "s.");
                return null;
            }
        }
        return messageCommands.get(name);
    }

    public void setAlias(String commandName, String[] aliases) {
        if (commandName == null || commandName.isBlank() || aliases == null) {
            throw new IllegalArgumentException("Command name and aliases cannot be null or blank");
        }
        if (this.aliases.containsKey(commandName)) {
            throw new IllegalStateException("Command name already exists: " + commandName);
        }

        Set<String> aliasSet = Set.copyOf(Arrays.asList(aliases));
        this.aliases.put(commandName, aliasSet);
        for (String alias : aliasSet) {
            if (alias == null || alias.isBlank()) {
                Logger.warning("Skipping invalid alias for command: " + commandName);
                continue;
            }
            String existing = aliasToCommandMap.putIfAbsent(alias, commandName);
            if (existing != null) {
                throw new IllegalStateException("Duplicate alias detected: '" + alias +
                        "' for command " + commandName + " (already used by " + existing + ")");
            }
        }
    }

    public String resolveCommandFromAlias(String alias) {
        return alias == null || alias.isBlank() ? null : aliasToCommandMap.getOrDefault(alias, alias);
    }

    public static void Shutdown() {
        if (jda != null) {
            jda.shutdownNow();
        }
        SHARED_POOL.shutdown();
        try {
            if (!SHARED_POOL.awaitTermination(5, TimeUnit.SECONDS)) {
                SHARED_POOL.shutdownNow();
            }
        } catch (InterruptedException e) {
            Logger.error("Interrupted during thread pool shutdown: " + e.getMessage());
            Thread.currentThread().interrupt();
        }
    }
}