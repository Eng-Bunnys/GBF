package org.bunnys.handler.utils.handler;

import net.dv8tion.jda.api.JDA;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.utils.Logger;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class EventManager {
    private static final int DEFAULT_TIMEOUT_SECONDS = 5;
    private final Config config;
    private final boolean loadEvents;
    private final boolean loadHandlerEvents;
    private final AtomicInteger eventCount = new AtomicInteger(0);

    public EventManager(Config config) {
        this.config = config;
        this.loadEvents = config.EventFolder() != null && !config.EventFolder().isBlank() && !config.IgnoreEvents();
        this.loadHandlerEvents = !config.IgnoreEventsFromHandler();
    }

    public CompletableFuture<Void> registerEvents(JDA builder) {
        eventCount.set(0);
        long start = System.currentTimeMillis();
        CompletableFuture<Void> handlerEventsFuture = CompletableFuture.completedFuture(null);
        CompletableFuture<Void> customEventsFuture = CompletableFuture.completedFuture(null);

        if (loadHandlerEvents)
            handlerEventsFuture = loadAndRegisterEvents("org.bunnys.handler.events.defaults", builder);

        if (loadEvents)
            customEventsFuture = loadAndRegisterEvents(config.EventFolder(), builder);

        return CompletableFuture.allOf(handlerEventsFuture, customEventsFuture)
                .thenRun(() -> {
                    if (config.LogActions()) {
                        Logger.success("Loaded " + eventCount.get() + " events in " +
                                (System.currentTimeMillis() - start) + "ms");
                    }
                })
                .exceptionally(throwable -> {
                    Logger.error("Event registration failed: " + throwable.getMessage());
                    return null;
                });
    }

    private CompletableFuture<Void> loadAndRegisterEvents(String packageName, JDA builder) {
        StringBuilder slowEvents = new StringBuilder();
        return CompletableFuture.supplyAsync(() -> EventLoader.loadEvents(packageName), GBF.SHARED_POOL)
                .thenCompose(events -> {
                    CompletableFuture<?>[] futures = events.stream()
                            .map(event -> CompletableFuture.runAsync(() -> {
                                        try {
                                            long eventStart = System.nanoTime();
                                            event.register(builder);
                                            long eventEnd = System.nanoTime();
                                            if (config.LogActions() && (eventEnd - eventStart) / 1_000_000 > 1) {
                                                synchronized (slowEvents) {
                                                    slowEvents.append("Slow event registration for ")
                                                            .append(event.getClass().getSimpleName())
                                                            .append(": ")
                                                            .append((eventEnd - eventStart) / 1_000_000)
                                                            .append("ms\n");
                                                }
                                            }
                                            eventCount.incrementAndGet();
                                        } catch (Exception e) {
                                            Logger.error("Failed to register event " + event.getClass().getName() + ": " + e.getMessage());
                                        }
                                    }, GBF.SHARED_POOL)
                                    .orTimeout(config.getTimeoutSeconds(DEFAULT_TIMEOUT_SECONDS), TimeUnit.SECONDS)
                                    .exceptionally(throwable -> {
                                        Logger.error("Failed to register event from " + packageName + ": " + throwable.getMessage());
                                        return null;
                                    }))
                            .toArray(CompletableFuture[]::new);
                    return CompletableFuture.allOf(futures);
                })
                .thenRun(() -> {
                    if (config.LogActions() && slowEvents.length() > 0) {
                        Logger.warning(slowEvents.toString());
                    }
                });
    }
}