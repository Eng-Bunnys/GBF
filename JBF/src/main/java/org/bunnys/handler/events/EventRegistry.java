package org.bunnys.handler.events;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class EventRegistry {

    private final ConcurrentHashMap<String, Event> events = new ConcurrentHashMap<>();

    void add(String className, Event event) {
        this.events.put(className, event);
    }

    public int size() {
        return this.events.size();
    }

    public boolean isEmpty() {
        return this.events.isEmpty();
    }

    /**
     * Return an immutable snapshot of the current handlers.
     */
    public Collection<Event> snapshot() {
        return List.copyOf(this.events.values());
    }

    /**
     * Register all handlers on a single shard (JDA).
     */
    public void registerAllOnShard(JDA jda) {
        for (Event event : snapshot()) {
            try {
                event.register(jda);
            } catch (Exception err) {
                Logger.error("[EventRegistry] Failed to register " + event.getClass().getName()
                        + " on shard " + jda.getShardInfo() + ": " + err.getMessage());
                Logger.error(err.getMessage()); // if supported
            }
        }
    }

    /**
     * Register all handlers on every current shard; prefer using shardManager.addEventListener when possible.
     */
    public void registerAllOn(ShardManager shardManager) {
        int shardCount = shardManager.getShards().size();
        Logger.info("[EventRegistry] Registering " + size() + " event(s) on " + shardCount + " shard(s)...");

        // If many handlers are EventListener, we could register them globally on shardManager
        // Fallback: register per-shard
        snapshot().forEach(handler -> {
            try {
                if (handler instanceof net.dv8tion.jda.api.hooks.EventListener el) {
                    // Register on the ShardManager (applies to all shards and future shards)
                    shardManager.addEventListener(el);
                    Logger.info("[EventRegistry] Registered EventListener globally: " + handler.getClass().getName());
                } else {
                    // fallback to per-shard registration
                    shardManager.getShards().forEach(jda -> {
                        try {
                            handler.register(jda);
                        } catch (Exception e) {
                            Logger.error("[EventRegistry] Failed to register " + handler.getClass().getName()
                                    + " on shard " + jda.getShardInfo() + ": " + e.getMessage());
                            Logger.error(e.getMessage(), e);
                        }
                    });
                }
            } catch (Exception e) {
                Logger.error("[EventRegistry] Error while registering handler " + handler.getClass().getName() + ": " + e.getMessage());
                Logger.error(e.getMessage(), e);
            }
        });

        Logger.success("[EventRegistry] Registration complete.");
    }

    public void logSummary() {
        Logger.info("[EventRegistry] Loaded events: " + size());
        for (Map.Entry<String, Event> event : this.events.entrySet()) {
            Logger.info(" - " + event.getKey());
        }
    }
}
