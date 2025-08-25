package org.bunnys.handler.events;

import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe registry for loaded events
 * Knows the client (JBF) for potential DI, metrics, or contextual logs
 */
public final class EventRegistry {
    private final ConcurrentHashMap<String, Event> events = new ConcurrentHashMap<>();
    private final Config config;

    public EventRegistry(JBF client) {
        this.config = client.getConfig();
    }

    public void add(Event event) {
        String eventName = event.getClass().getName();
        Event previous = this.events.put(eventName, event);
        if (previous != null)
            Logger.warning("[EventRegistry] Overriding existing event: " + eventName);
         else
            Logger.debug("[EventRegistry] Added event: " + eventName);
    }

    public boolean isEmpty() {
        return this.events.isEmpty();
    }

    public int size() {
        return this.events.size();
    }

    public Collection<Event> snapshot() {
        return List.copyOf(this.events.values());
    }

    /**
     * Registers all events on the provided ShardManager
     * - If an event is also a JDA EventListener, register globally once
     * - Otherwise, call event.register(...) per shard (parallelized)
     */
    public void registerAll(ShardManager shardManager) {
        int shardCount = shardManager.getShards().size();
        if (this.config.debug())
          Logger.info("[EventRegistry] Registering "
                + size() + " event" + (size() > 1 ? "s" : "")
                + " across " + shardCount + " shard" + (shardCount > 1 ? "s" : "")
                + "...");

        // Parallelize event-level work
        snapshot().parallelStream().forEach(event -> {
            try {
                if (event instanceof net.dv8tion.jda.api.hooks.EventListener listener) {
                    // Global listener applies to current + future shards
                    shardManager.addEventListener(listener);
                    if (this.config.debug())
                        Logger.info("[EventRegistry] Registered globally: " + event.getClass().getName());
                } else {
                    // Register per shard in parallel to avoid bottlenecks on large shard counts
                    shardManager.getShards().parallelStream().forEach(jda -> {
                        try {
                            event.register(jda);
                           if (this.config.debug())
                            Logger.debug("[EventRegistry] Registered " + event.getClass().getName()
                                    + " on shard " + jda.getShardInfo());
                        } catch (Exception e) {
                            if (this.config.debug())
                               Logger.error("[EventRegistry] Failed to register "
                                       + event.getClass().getName()
                                    + " on shard " + jda.getShardInfo(), e);
                        }
                    });
                }
            } catch (Exception e) {
                Logger.error("[EventRegistry] Registration error for " + event.getClass().getName(), e);
            }
        });

        if (this.config.debug())
           Logger.success("[EventRegistry] Registration complete");

        Logger.debug("[EventRegistry] Final event count: " + size());
    }
}
