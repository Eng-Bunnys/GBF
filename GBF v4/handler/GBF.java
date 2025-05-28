package org.bunnys.handler;

import net.dv8tion.jda.api.JDA;
import org.bunnys.handler.commands.message.config.MessageCommand;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.Logger;
import org.bunnys.handler.utils.handler.BotInitializer;
import org.bunnys.handler.utils.handler.CommandManager;
import org.bunnys.handler.utils.handler.EventManager;
import org.bunnys.handler.utils.handler.ShutdownManager;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * GBF Handler v4
 * Facade class coordinating bot initialization, command management, event registration, and shutdown.
 */
public class GBF {
    private static final int CORE_POOL_SIZE = Math.max(2, Runtime.getRuntime().availableProcessors());
    private static final int MAX_POOL_SIZE = CORE_POOL_SIZE * 2;
    private static final long KEEP_ALIVE_TIME = 60L;
    private static final AtomicInteger threadCounter = new AtomicInteger(0);

    // Custom ThreadFactory for naming threads and setting priority
    private static class GBFThreadFactory implements ThreadFactory {
        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r, "gbf-worker-" + threadCounter.getAndIncrement());
            thread.setPriority(Thread.NORM_PRIORITY);
            thread.setDaemon(true);
            return thread;
        }
    }

    public static final ThreadPoolExecutor SHARED_POOL = new ThreadPoolExecutor(
            CORE_POOL_SIZE,
            MAX_POOL_SIZE,
            KEEP_ALIVE_TIME,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(100),
            new GBFThreadFactory(),
            (r, executor) -> Logger.error("Task rejected in thread pool: " + r)
    );

    private static volatile GBF client;
    private final Config config;
    private final BotInitializer botInitializer;
    private final CommandManager commandManager;
    private final EventManager eventManager;
    private final ShutdownManager shutdownManager;
    private final long startTime = System.currentTimeMillis();

    public GBF(Config config) {
        if (config == null) throw new IllegalArgumentException("Config cannot be null");
        this.config = config;

        synchronized (GBF.class) {
            if (client != null) throw new IllegalStateException("GBF instance already exists");
            client = this;
        }

        this.botInitializer = new BotInitializer(config);
        this.commandManager = new CommandManager(config);
        this.eventManager = new EventManager(config);
        this.shutdownManager = new ShutdownManager();

        if (config.AutoLogin()) {
            try {
                login();
            } catch (InterruptedException e) {
                Logger.error("Login interrupted: " + e.getMessage());
                Thread.currentThread().interrupt();
            }
        }
    }

    public void login() throws InterruptedException {
        botInitializer.login().join(); // Ensure JDA is initialized
        CompletableFuture.allOf(
                        eventManager.registerEvents(botInitializer.getJDA()),
                        commandManager.registerCommandsAsync()
                ).thenRun(() -> botInitializer.awaitReady(() -> Logger.success("GBF Handler v4.1 is ready! Took " +
                        (System.currentTimeMillis() - startTime) + "ms to load")))
                .exceptionally(throwable -> {
                    Logger.error("Startup failed: " + throwable.getMessage());
                    return null;
                });
    }

    public static GBF getClient() {
        return client;
    }

    public Config getConfig() {
        return config;
    }

    public static JDA getJDA() {
        return BotInitializer.getJDA();
    }

    public static String getHandlerVersion() {
        return "4.1.0";
    }

    public MessageCommand getMessageCommand(String name) {
        return commandManager.getMessageCommand(name).join();
    }

    public void setAlias(String commandName, String[] aliases) {
        commandManager.setAlias(commandName, aliases);
    }

    public String resolveCommandFromAlias(String alias) {
        return commandManager.resolveCommandFromAlias(alias);
    }

    public static void Shutdown() {
        ShutdownManager.Shutdown();
    }
}