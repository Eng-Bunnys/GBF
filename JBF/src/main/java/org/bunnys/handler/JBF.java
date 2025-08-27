package org.bunnys.handler;

import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.lifecycle.*;

@SuppressWarnings("unused")
public class JBF {
    private final Config config;
    private volatile ShardManager shardManager;

    // Registries
    private final CommandRegistry commandRegistry = new CommandRegistry();

    public JBF(Config config) {
        if (config == null)
            throw new IllegalArgumentException("Config cannot be null");

        this.config = config;

        if (this.config.autoLogin())
            this.login();
    }

    /**
     * Initializes everything needed for the bot to run
     */
    private void login() {
        LoggerLifecycle.attachLogger(config);
        StartupLogger.logStartupInfo(config);

        this.shardManager = ShardManagerInitializer.initShardManager(config);

        EventLifecycle.loadAndRegisterEvents(config, this, shardManager);
        CommandLifecycle.loadAndRegisterCommands(config, this, commandRegistry);
    }

    /* -------------------- Public API -------------------- */

    public void updateToken(String newToken) {
        if (newToken == null || newToken.isBlank())
            throw new IllegalArgumentException("New token cannot be null or blank");
        this.config.token(newToken);
    }

    public void reconnect(String newToken) {
        ShardManagerLifecycle.reconnect(this, newToken);
    }

    public void shutdown() {
        ShardManagerLifecycle.shutdown(this);
    }

    /* -------------------- Getters -------------------- */
    public ShardManager getShardManager() {
        return shardManager;
    }

    public Config getConfig() {
        return config;
    }

    public CommandRegistry commandRegistry() {
        return commandRegistry;
    }

    /* -------------------- Internal use -------------------- */
    public void setShardManager(ShardManager sm) {
        this.shardManager = sm;
    }
}
