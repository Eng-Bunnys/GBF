package org.bunnys.handler;

import net.dv8tion.jda.api.sharding.DefaultShardManagerBuilder;
import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.events.EventRegistry;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.util.List;

/**
 * JBF bootstrap/lifecycle manager
 * Clear lifecycle:
 * - attachLogger()
 * - initShardManager()
 * - loadAndRegisterEvents()
 * - reconnect()/shutdown()
 */
public class JBF {
    private final Config config;
    private volatile ShardManager shardManager;

    public JBF(Config config) {
        if (config == null)
            throw new IllegalArgumentException("Config cannot be null");
        this.config = config;

        this.attachLogger();
        this.logStartupInfo();

        this.initShardManager(config.token());
        this.loadAndRegisterEvents(config.eventsPackage());
    }

    /* -------------------- Lifecycle helpers -------------------- */

    private void attachLogger() {
        Logger.attachConfig(config);
    }

    private void logStartupInfo() {
        Logger.debug("JBF Handler is starting...");
        Logger.debug("Shard Mode: " + (config.shardCount() > 0
                ? "Manual (" + config.shardCount() + (config.shardCount() > 1 ? " shards)" : " shard)")
                : "Auto-sharding"));
    }

    private void initShardManager(String token) {
        try {
            Logger.debug("Initializing ShardManager...");

            DefaultShardManagerBuilder builder = DefaultShardManagerBuilder.createDefault(token);
            configureShards(builder);

            this.shardManager = builder.build();

            try {
                if (this.config.debug())
                    Logger.success("ShardManager initialized. Total shards (gateway): "
                            + this.shardManager.getShardsTotal());
            } catch (Exception ignore) {
                if (this.config.debug())
                    Logger.success("ShardManager initialized successfully.");
            }
        } catch (Exception e) {
            Logger.error("Failed to initialize ShardManager: " + e.getMessage(), e);
            throw new IllegalStateException("Unable to initialize ShardManager", e);
        }
    }

    private void configureShards(DefaultShardManagerBuilder builder) {
        if (config.shardCount() > 0) {
            builder.setShardsTotal(config.shardCount());
            Logger.debug("Using manual shard count: " + config.shardCount());
        } else
            Logger.debug("Using auto-sharding (JDA determines shard count)");

        // place for gateway intents, member caching, session controllers, etc.
        // e.g. builder.enableIntents(GatewayIntent.GUILD_MESSAGES, ...);
    }

    private void loadAndRegisterEvents(String basePackage) {
        if (this.config.debug())
            Logger.info("[JBF] Loading events from config package: " + basePackage);

        EventLoader loader = new EventLoader(basePackage, this);
        List<Event> events = loader.loadEvents();

        if (events.isEmpty()) {
            Logger.warning("[JBF] No events were loaded; skipping registration.");
            return;
        }

        EventRegistry registry = new EventRegistry(this);
        events.forEach(registry::add);

        registry.registerAll(this.shardManager);
        Logger.debug("[JBF] Loaded " + registry.size() + " event(s).");
    }

    /* -------------------- Public API -------------------- */

    public void reconnect(String newToken) {
        Logger.warning("Attempting to reconnect with a new token...");
        this.shutdownShardManager("Previous ShardManager has been shut down.");

        this.config.token(newToken);
        this.initShardManager(newToken);
        this.loadAndRegisterEvents(this.config.eventsPackage());
    }

    public void shutdown() {
        this.shutdownShardManager("ShardManager shutdown complete.");
    }

    private void shutdownShardManager(String afterMsg) {
        ShardManager sm = this.shardManager;
        if (sm != null) {
            try {
                sm.shutdown();
                Logger.info(afterMsg);
            } catch (Exception e) {
                Logger.error("Error during ShardManager shutdown: " + e.getMessage(), e);
            } finally {
                this.shardManager = null;
            }
        } else
            Logger.debug("Shutdown requested but ShardManager was null.");
    }

    /* -------------------- Getters -------------------- */

    public ShardManager getShardManager() {
        return shardManager;
    }

    public Config getConfig() {
        return config;
    }
}
