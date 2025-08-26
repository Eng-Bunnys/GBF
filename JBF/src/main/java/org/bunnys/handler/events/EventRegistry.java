package org.bunnys.handler.events;

import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe registry for loaded events
 * Knows the client (JBF) for potential DI, metrics, or contextual logs
 */
public final class EventRegistry {
    private final ConcurrentHashMap<String, Event> events = new ConcurrentHashMap<>();
    private final Config config;
    private final Set<String> globalListeners = ConcurrentHashMap.newKeySet();

    public EventRegistry(JBF client) {
        this.config = client.getConfig();
    }

    public void add(Event event) {
        String eventName = event.getClass().getName();
        Event previous = this.events.put(eventName, event);
        if (previous != null)
            Logger.warning("[EventRegistry] Overriding existing event: " + eventName);
        else
            Logger.debug(() -> "[EventRegistry] Added event: " + eventName);
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
        final var shards = List.copyOf(shardManager.getShards());
        final boolean dbg = config.debug();

        if (dbg) {
            Logger.info("[EventRegistry] Registering " + size() + " event"
                    + (size() > 1 ? "s" : "") + " across " + shards.size() + " shard"
                    + (shards.size() > 1 ? "s" : "") + "...");
        }

        for (Event event : snapshot()) {
            try {
                if (event instanceof net.dv8tion.jda.api.hooks.EventListener listener) {
                    if (this.globalListeners.add(event.getClass().getName())) {
                        shardManager.addEventListener(listener);
                        if (dbg)
                            Logger.info("[EventRegistry] Registered globally: " + event.getClass().getName());
                    }
                } else {
                    for (var jda : shards) {
                        try {
                            event.register(jda);
                            if (dbg)
                                Logger.debug(() -> "[EventRegistry] Registered " + event.getClass().getName()
                                        + " on shard " + jda.getShardInfo());
                        } catch (Exception e) {
                            if (dbg)
                                Logger.error("[EventRegistry] Failed to register "
                                        + event.getClass().getName() + " on shard " + jda.getShardInfo(), e);
                        }
                    }
                }
            } catch (Exception e) {
                Logger.error("[EventRegistry] Registration error for " + event.getClass().getName(), e);
            }
        }

        if (dbg)
            Logger.success("[EventRegistry] Registration complete");
        Logger.debug(() -> "[EventRegistry] Final event count: " + size());
    }
}
