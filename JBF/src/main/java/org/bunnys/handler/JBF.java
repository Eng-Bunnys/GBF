package org.bunnys.handler;

import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.sharding.DefaultShardManagerBuilder;
import net.dv8tion.jda.api.sharding.ShardManager;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import net.dv8tion.jda.api.utils.cache.CacheFlag;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.events.EventRegistry;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.util.EnumSet;
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
        Logger.debug(() -> "JBF Handler is starting... Shard Mode: " + (config.shardCount() > 0
                ? "Manual (" + config.shardCount() + (config.shardCount() > 1 ? " shards)" : " shard)")
                : "Auto-sharding"));
    }

    private void initShardManager(String token) {
        try {
            Logger.debug(() -> "Initializing ShardManager...");

            DefaultShardManagerBuilder builder = DefaultShardManagerBuilder.createDefault(token);
            this.configureShards(builder);

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
        if (this.config.shardCount() > 0) {
            builder.setShardsTotal(this.config.shardCount());
            Logger.debug(() -> "Using manual shard count: " + this.config.shardCount());
        } else {
            Logger.debug(() -> "Using auto-sharding (JDA determines shard count)");
        }

        // Intents
        if (!this.config.intents().isEmpty()) {
            builder.enableIntents(this.config.intents());
            Logger.debug(() -> "Enabled " + this.config.intents().size() + " gateway intents: " + this.config.intents());
        }

        // Skip chunking & member cache unless GUILD_MEMBERS is enabled
        if (!this.config.intents().contains(GatewayIntent.GUILD_MEMBERS)) {
            builder.setChunkingFilter(ChunkingFilter.NONE);
            builder.setMemberCachePolicy(MemberCachePolicy.NONE);
            Logger.debug(() -> "GUILD_MEMBERS intent not enabled. Disabling chunking and member cache.");
        }

        // Disable unnecessary heavy caches
        EnumSet<CacheFlag> toDisable = EnumSet.of(CacheFlag.EMOJI,
                CacheFlag.STICKER,
                CacheFlag.SCHEDULED_EVENTS);

        Logger.debug(() -> "Initializing caches to disable: " + toDisable);

        if (!this.config.intents().contains(GatewayIntent.GUILD_PRESENCES)) {
            toDisable.add(CacheFlag.ACTIVITY);
            Logger.debug(() -> "GUILD_PRESENCES intent not enabled. Adding ACTIVITY to caches to disable.");
        }

        if (!this.config.intents().contains(GatewayIntent.GUILD_VOICE_STATES)) {
            toDisable.add(CacheFlag.VOICE_STATE);
            Logger.debug(() -> "GUILD_VOICE_STATES intent not enabled. Adding VOICE_STATE to caches to disable.");
        }

        if (!toDisable.isEmpty()) {
            builder.disableCache(toDisable);
            Logger.debug(() -> "Final caches to disable: " + toDisable);
        }

        builder.setEventManagerProvider(shardId -> {
            Logger.debug(() -> "Setting up InterfacedEventManager for shard " + shardId + ".");
            return new net.dv8tion.jda.api.hooks.InterfacedEventManager();
        });
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
        Logger.debug(() -> "[JBF] Loaded " + registry.size() + " event" + (registry.size() == 1 ? "" : "s") + ".");
    }

    /* -------------------- Public API -------------------- */

    public void reconnect(String newToken) {
        Logger.warning("Attempting to reconnect with a new token...");
        this.shutdownShardManager("Previous ShardManager has been shut down.");

        this.config.token(newToken);
        this.initShardManager(newToken);
        this.loadAndRegisterEvents(this.config.eventsPackage());
    }

    /**
     * Gracefully shuts down the ShardManager and releases resources
     * After calling this method, the JBF instance should not be used again
     * If you reconnect too quickly, shards may overlap
     */
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
            Logger.debug(() -> "Shutdown requested but ShardManager was null.");
    }

    /* -------------------- Getters -------------------- */

    public ShardManager getShardManager() {
        return shardManager;
    }

    public Config getConfig() {
        return config;
    }
}
