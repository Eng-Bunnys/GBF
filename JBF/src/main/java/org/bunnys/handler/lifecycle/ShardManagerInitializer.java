package org.bunnys.handler.lifecycle;

import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.sharding.DefaultShardManagerBuilder;
import net.dv8tion.jda.api.sharding.ShardManager;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import net.dv8tion.jda.api.utils.cache.CacheFlag;
import org.bunnys.handler.Config;
import org.bunnys.handler.utils.Logger;

import java.util.EnumSet;

public class ShardManagerInitializer {

    public static ShardManager initShardManager(Config config) {
        try {
            Logger.debug(() -> "Initializing ShardManager...");

            DefaultShardManagerBuilder builder = DefaultShardManagerBuilder.createDefault(config.token());
            configureShards(builder, config);
            ShardManager sm = builder.build();

            if (config.debug())
                Logger.success("ShardManager initialized. Total shards (gateway): " + sm.getShardsTotal());

            return sm;
        } catch (Exception e) {
            Logger.error("Failed to initialize ShardManager: " + e.getMessage(), e);
            throw new IllegalStateException("Unable to initialize ShardManager", e);
        }
    }

    private static void configureShards(DefaultShardManagerBuilder builder, Config config) {
        if (config.shardCount() > 0) {
            builder.setShardsTotal(config.shardCount());
            Logger.debug(() -> "Using manual shard count: " + config.shardCount());
        } else {
            Logger.debug(() -> "Using auto-sharding (JDA determines shard count)");
        }

        if (!config.intents().isEmpty())
            builder.enableIntents(config.intents());

        if (!config.intents().contains(GatewayIntent.GUILD_MEMBERS)) {
            builder.setChunkingFilter(ChunkingFilter.NONE);
            builder.setMemberCachePolicy(MemberCachePolicy.NONE);
            Logger.debug(() -> "GUILD_MEMBERS intent not enabled. Disabling chunking and member cache.");
        }

        EnumSet<CacheFlag> toDisable = EnumSet.noneOf(CacheFlag.class);

        if (!config.intents().contains(GatewayIntent.GUILD_PRESENCES))
            toDisable.add(CacheFlag.ACTIVITY);

        if (!config.intents().contains(GatewayIntent.GUILD_VOICE_STATES))
            toDisable.add(CacheFlag.VOICE_STATE);

        if (!toDisable.isEmpty())
            builder.disableCache(toDisable);

        builder.setEventManagerProvider(shardId -> new net.dv8tion.jda.api.hooks.InterfacedEventManager());
    }
}
