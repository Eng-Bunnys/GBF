// src/main/java/org/bunnys/handler/JBF.java
package org.bunnys.handler;

import net.dv8tion.jda.api.sharding.DefaultShardManagerBuilder;
import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.events.EventRegistry;
import org.bunnys.handler.utils.Logger;

public class JBF {

    private final Config config;
    private ShardManager shardManager;

    public JBF(Config config) {
        if (config == null)
            throw new IllegalArgumentException("Config cannot be null");

        this.config = config;

        if (this.config.debug())
            Logger.info("[DEBUG MODE]\nJBF Handler is now online." +
                    "\nShard Mode: "
                    + (config.shardCount() > 0
                    ? "Manual (" + config.shardCount()
                    + " shard" + (config.shardCount() > 1 ? "s)" : ")") : "Auto-sharding"));

        this.login(config.token());
    }

    private void login(String token) {
        try {
            if (this.config.debug()) Logger.info("Initializing ShardManager...");

            DefaultShardManagerBuilder builder = DefaultShardManagerBuilder.createDefault(token);

            if (config.shardCount() > 0) {
                builder.setShardsTotal(config.shardCount());
                if (this.config.debug())
                 Logger.info("Using manual shard count: " + config.shardCount());
            } else
                if (this.config.debug())
                  Logger.info("Using auto-sharding (JDA will determine shard count automatically)");

            shardManager = builder.build();

            // Helpful runtime shard info
            try {
                int total = shardManager.getShardsTotal();
                if (this.config.debug())
                 Logger.success("ShardManager initialized. Total shards (gateway): " + total);
            } catch (Exception ignore) {
                if (this.config.debug())
                 Logger.success("ShardManager initialized successfully.");
            }

            // --- AUTO LOAD + REGISTER EVENTS FROM CONFIG ---
            final String basePkg = config.eventsPackage();
            Logger.info("[JBF] Loading events from config package: " + basePkg);
            EventRegistry registry = EventLoader.load(basePkg, this);
            if (!registry.isEmpty()) {
                registry.registerAll(this.shardManager);
            } else {
                Logger.warning("[JBF] No events were loaded; skipping registration.");
            }

        } catch (Exception e) {
            Logger.error("Failed to initialize ShardManager: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void reconnect(String newToken) {
        Logger.warning("Attempting to reconnect with a new token...");

        if (this.shardManager != null) {
            this.shardManager.shutdown();
            Logger.info("Previous ShardManager has been shut down.");
        }

        this.config.token(newToken);
        this.login(newToken);
    }

    public ShardManager getShardManager() { return shardManager; }
    public Config getConfig() { return config; }
}
