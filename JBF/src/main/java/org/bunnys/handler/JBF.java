package org.bunnys.handler;

import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.sharding.DefaultShardManagerBuilder;
import net.dv8tion.jda.api.sharding.ShardManager;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import net.dv8tion.jda.api.utils.cache.CacheFlag;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.events.EventRegistry;
import org.bunnys.handler.events.defaults.DefaultEvents;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.util.EnumSet;

/**
 * JBF bootstrap/lifecycle manager
 */
public class JBF {
    private final Config config;
    private volatile ShardManager shardManager;

    public JBF(Config config) {
        if (config == null)
            throw new IllegalArgumentException("Config cannot be null");

        this.config = config;

        if (this.config.autoLogin())
            this.login();
    }

    /**
     * Initializes everything needed for the bot to run
     * Steps:
     * - attachLogger()
     * - logStartupInfo()
     * - initShardManager()
     * - loadAndRegisterEvents()
     */
    private void login() {
        this.attachLogger();
        this.logStartupInfo();
        this.initShardManager(this.config.token());
        this.loadAndRegisterEvents(this.config.eventsPackage());
    }

    /* -------------------- Lifecycle helpers -------------------- */

    private void attachLogger() {
        Logger.attachConfig(this.config);
    }

    private void logStartupInfo() {
        Logger.debug(() -> "JBF Handler is starting... Shard Mode: " +
                (this.config.shardCount() > 0
                        ? "Manual (" + this.config.shardCount() +
                                (this.config.shardCount() > 1 ? " shards)" : " shard)")
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
                    Logger.success("ShardManager initialized. Total shards (gateway): " +
                            this.shardManager.getShardsTotal());
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
        } else
            Logger.debug(() -> "Using auto-sharding (JDA determines shard count)");

        // Intents
        if (!this.config.intents().isEmpty())
            builder.enableIntents(this.config.intents());

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

        if (!this.config.intents().contains(GatewayIntent.GUILD_PRESENCES))
            toDisable.add(CacheFlag.ACTIVITY);

        if (!this.config.intents().contains(GatewayIntent.GUILD_VOICE_STATES))
            toDisable.add(CacheFlag.VOICE_STATE);

        if (!toDisable.isEmpty())
            builder.disableCache(toDisable);

        builder.setEventManagerProvider(shardId -> {
            return new net.dv8tion.jda.api.hooks.InterfacedEventManager();
        });
    }

    private void loadAndRegisterEvents(String basePackage) {
        EventRegistry registry = new EventRegistry(this);

        if (this.config.debug())
            Logger.info("[JBF] Loading events from config package: " + basePackage);

        if (basePackage != null && !basePackage.isBlank()) {
            EventLoader loader = new EventLoader(basePackage, this);
            loader.loadEvents().forEach(registry::add);
        }

        if (this.config.debug())
            Logger.info("[JBF] Loading default events...");

        for (var def : DefaultEvents.values()) {
            if (this.config.disabledDefaults().contains(DefaultEvents.ALL)) {
                Logger.debug(() -> "[JBF] All default events are disabled.");
                break; // skip all
            }

            if (def == DefaultEvents.ALL)
                continue; // skip pseudo entry

            if (!this.config.disabledDefaults().contains(def)) {
                try {
                    Event event = def.create(this);
                    registry.add(event);
                    Logger.debug(() -> "[JBF] Registered default event: " + def.name());
                } catch (Exception e) {
                    Logger.error("[JBF] Failed to initialize default event: " + def.name(), e);
                }
            } else {
                Logger.debug(() -> "[JBF] Skipped disabled default event: " + def.name());
            }
        }

        if (registry.isEmpty()) {
            Logger.warning("[JBF] No events were loaded; skipping registration.");
            return;
        }

        registry.registerAll(this.shardManager);
        Logger.success("[JBF] Loaded " + registry.size() + " event"
                + (registry.size() == 1 ? "" : "s") + ".");
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
