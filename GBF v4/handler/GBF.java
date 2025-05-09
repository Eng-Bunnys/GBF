package org.bunnys.handler;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import org.bunnys.handler.commands.CommandLoader;
import org.bunnys.handler.commands.message.MessageCommand;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.utils.EnvLoader;
import org.bunnys.handler.utils.Logger;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/***
 * GBF Handler v4
 * Most optimized version of the GBF Handler.
 * Optimized for performance with asynchronous loading and parallel processing.
 * Written by Bunnys
 */
public class GBF {
    private final Config config;
    private static GBF client;
    private static JDA jda;

    // Events
    private final boolean loadEvents;
    private final boolean loadHandlerEvents;
    private final AtomicInteger eventCount = new AtomicInteger(0);

    // Commands
    private final ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> aliases = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> aliasToCommandMap = new ConcurrentHashMap<>();
    private volatile boolean commandsLoaded = false;

    private final long startTime = System.currentTimeMillis();

    public GBF(Config config) {
        if (config == null)
            throw new IllegalArgumentException("Config cannot be null");

        this.config = config;

        if (this.config.token() == null || this.config.token().isBlank()) {
            String token = this.getToken();

            if (token == null || token.isBlank())
                throw new IllegalStateException("Bot token is not specified in config or environment.");

            this.config.token(token);
        }

        GBF.client = this;

        this.loadEvents = this.config.EventFolder() != null
                && !this.config.EventFolder().isBlank()
                && !this.config.IgnoreEvents();

        this.loadHandlerEvents = !this.config.IgnoreEventsFromHandler();

        if (this.config.AutoLogin())
            try {
                this.login();
            } catch (InterruptedException err) {
                Logger.error("Error logging in: " + err.getMessage() +
                        "\nStack trace: " + Arrays.toString(err.getStackTrace()));
            }
    }

    private void RegisterCommandsAsync() {
        long start = System.currentTimeMillis();
        try {
            if (this.config.CommandsFolder() == null || this.config.CommandsFolder().isBlank()) {
                Logger.warning("Commands folder not specified. Skipping command registration.");
                commandsLoaded = true;
                return;
            }

            ForkJoinPool threadPool = new ForkJoinPool(Math.max(2, Runtime.getRuntime().availableProcessors()));
            CompletableFuture.supplyAsync(() -> {
                try {
                    return CommandLoader.loadCommands(this.config.CommandsFolder());
                } catch (Exception e) {
                    Logger.error("Failed to load commands: " + e.getMessage() +
                            "\nStack trace: " + Arrays.toString(e.getStackTrace()));
                    throw e;
                }
            }, threadPool).orTimeout(10, TimeUnit.SECONDS)
                    .whenComplete((commands, throwable) -> {
                        try {
                            if (throwable != null) {
                                Logger.error("Command loading failed: " + throwable.getMessage() +
                                        "\nStack trace: " + Arrays.toString(throwable.getStackTrace()));
                                return;
                            }
                            messageCommands.putAll(commands);
                            commandsLoaded = true;
                            Logger.success("Loaded " + messageCommands.size() + " commands in " +
                                    (System.currentTimeMillis() - start) + "ms");
                        } finally {
                            threadPool.shutdown();
                        }
                    }).exceptionally(throwable -> {
                        Logger.error("Command loading timed out or failed: " + throwable.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            Logger.error("Failed to initiate command registration: " + e.getMessage() +
                    "\nStack trace: " + Arrays.toString(e.getStackTrace()));
            commandsLoaded = true;
        }
    }

    private void RegisterEvents(JDA builder) {
        long start = System.currentTimeMillis();
        try {
            ForkJoinPool threadPool = new ForkJoinPool(Math.max(2, Runtime.getRuntime().availableProcessors()));

            CompletableFuture<Void> handlerEventsFuture = CompletableFuture.completedFuture(null);
            CompletableFuture<Void> customEventsFuture = CompletableFuture.completedFuture(null);

            if (this.loadHandlerEvents) {
                String handlerEventFolder = "org.bunnys.handler.events.defaults";

                handlerEventsFuture = CompletableFuture
                        .supplyAsync(() -> EventLoader.loadEvents(handlerEventFolder), threadPool)
                        .thenAcceptAsync(handlerEvents -> handlerEvents.forEach(event -> {
                            try {
                                long eventStart = System.nanoTime();
                                event.register(builder);
                                long eventEnd = System.nanoTime();

                                if ((eventEnd - eventStart) / 1_000_000 > 1)
                                    Logger.warning(
                                            "Slow event registration for " + event.getClass().getSimpleName() +
                                                    ": " + (eventEnd - eventStart) / 1_000_000 + "ms");

                                if (this.config.LogActions())
                                    this.eventCount.incrementAndGet();
                            } catch (Exception e) {
                                Logger.error("Failed to register handler event " + event.getClass().getName() + ": "
                                        +
                                        e.getMessage() + "\nStack trace: " + Arrays.toString(e.getStackTrace()));
                            }
                        }), threadPool);
            }

            if (this.loadEvents) {
                customEventsFuture = CompletableFuture
                        .supplyAsync(() -> EventLoader.loadEvents(this.config.EventFolder()), threadPool)
                        .thenAcceptAsync(events -> events.forEach(event -> {
                            try {
                                long eventStart = System.nanoTime();
                                event.register(builder);
                                long eventEnd = System.nanoTime();

                                if ((eventEnd - eventStart) / 1_000_000 > 1)
                                    Logger.warning(
                                            "Slow event registration for " + event.getClass().getSimpleName() +
                                                    ": " + (eventEnd - eventStart) / 1_000_000 + "ms");

                                if (this.config.LogActions())
                                    this.eventCount.incrementAndGet();
                            } catch (Exception e) {
                                Logger.error("Failed to register custom event " + event.getClass().getName() + ": "
                                        +
                                        e.getMessage() + "\nStack trace: " + Arrays.toString(e.getStackTrace()));
                            }
                        }), threadPool);
            }

            CompletableFuture.allOf(handlerEventsFuture, customEventsFuture)
                    .orTimeout(10, TimeUnit.SECONDS)
                    .whenComplete((result, throwable) -> {
                        if (throwable != null)
                            Logger.error("Event registration failed: " + throwable.getMessage() +
                                    "\nStack trace: " + Arrays.toString(throwable.getStackTrace()));
                        else
                            Logger.success("Loaded " + eventCount.get() + " events in " +
                                    (System.currentTimeMillis() - start) + "ms");
                    }).join();

        } catch (Exception e) {
            Logger.error("Error loading events: " + e.getMessage() +
                    "\nStack trace: " + Arrays.toString(e.getStackTrace()));
        }
    }

    public void login() throws InterruptedException {
        long jdaStart = System.currentTimeMillis();
        try {
            List<GatewayIntent> intents = this.config.intents();

            if (intents.isEmpty()) {
                Logger.warning("No GatewayIntents specified. Defaulting to basic intents.");
                intents = Arrays.asList(GatewayIntent.GUILD_MESSAGES, GatewayIntent.DIRECT_MESSAGES);
            }

            int retries = 3;
            for (int i = 0; i < retries; i++) {
                try {
                    GBF.jda = JDABuilder.create(this.config.token(), intents)
                            .setMemberCachePolicy(MemberCachePolicy.DEFAULT)
                            .setChunkingFilter(ChunkingFilter.NONE)
                            .build();
                    break;
                } catch (Exception e) {
                    if (i == retries - 1) {
                        throw new RuntimeException("Failed to initialize JDA after " + retries + " attempts", e);
                    }
                    Logger.warning("JDA initialization failed, retrying (" + (i + 1) + "/" + retries + "): " +
                            e.getMessage());
                    Thread.sleep(1000); // Wait 1 second before retrying
                }
            }

            Logger.info("JDA initialization took " + (System.currentTimeMillis() - jdaStart) + "ms");

            CompletableFuture<Void> eventRegistration = CompletableFuture.runAsync(() -> {
                RegisterEvents(GBF.jda);
                RegisterCommandsAsync();
            });

            CompletableFuture<Void> botReady = CompletableFuture.runAsync(() -> {
                try {
                    GBF.jda.awaitReady();
                    if (this.config.LogActions()) {
                        long endTime = System.currentTimeMillis();
                        Logger.success("GBF Handler v4 is ready! Took " + (endTime - this.startTime) + "ms to load");
                    }
                } catch (InterruptedException e) {
                    Logger.error("Error waiting for bot to be ready: " + e.getMessage() +
                            "\nStack trace: " + Arrays.toString(e.getStackTrace()));
                }
            });

            CompletableFuture.allOf(eventRegistration, botReady).join();
        } catch (Exception err) {
            Logger.error("Error logging in: " + err.getMessage() +
                    "\nStack trace: " + Arrays.toString(err.getStackTrace()));
            throw new RuntimeException("Login failed", err);
        }
    }

    public static GBF getClient() {
        return GBF.client;
    }

    public Config getConfig() {
        return this.config;
    }

    public static JDA getJDA() {
        return GBF.jda;
    }

    public static String getHandlerVersion() {
        return "4.0.0";
    }

    private String getToken() {
        return EnvLoader.get("TOKEN");
    }

    public MessageCommand getMessageCommand(String name) {
        if (name == null || name.isBlank()) {
            Logger.warning("Command name cannot be null or blank.");
            return null;
        }
        if (!commandsLoaded) {
            Logger.warning("Commands not yet loaded. Blocking until ready (timeout 10s).");
            long startWait = System.currentTimeMillis();
            while (!commandsLoaded && (System.currentTimeMillis() - startWait) < 10_000) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Logger.error("Interrupted while waiting for commands to load: " + e.getMessage() +
                            "\nStack trace: " + Arrays.toString(e.getStackTrace()));
                    Thread.currentThread().interrupt();
                }
            }
            if (!commandsLoaded) {
                Logger.error("Command loading timed out after 10s.");
                return null;
            }
        }
        return messageCommands.get(name);
    }

    public void setAlias(String commandName, String[] aliases) {
        if (commandName == null || commandName.isBlank()) {
            throw new IllegalArgumentException("Command name cannot be null or blank");
        }
        if (aliases == null) {
            throw new IllegalArgumentException("Aliases cannot be null");
        }
        if (this.aliases.containsKey(commandName)) {
            throw new IllegalStateException("Command name already exists: " + commandName);
        }

        Set<String> aliasSet = Set.copyOf(Arrays.asList(aliases));
        this.aliases.put(commandName, aliasSet);

        for (String alias : aliasSet) {
            if (alias == null || alias.isBlank()) {
                Logger.warning("Skipping invalid alias (null or blank) for command: " + commandName);
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
        if (alias == null || alias.isBlank()) {
            Logger.warning("Alias cannot be null or blank for resolution.");
            return null;
        }
        return aliasToCommandMap.getOrDefault(alias, alias);
    }
}