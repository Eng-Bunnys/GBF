package org.bunnys.handler;

import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.database.DatabaseLifecycle;
import org.bunnys.handler.database.connectors.MongoConnector;
import org.bunnys.handler.lifecycle.*;

@SuppressWarnings("unused")
public class BunnyNexus {
    private final Config config;
    private volatile ShardManager shardManager;

    // Registries & Lifecycle Handlers
    private final CommandRegistry commandRegistry = new CommandRegistry();
    private final DatabaseLifecycle databaseLifecycle = new DatabaseLifecycle();

    public BunnyNexus(Config config) {
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

        //TODO: Cleanup later
        String mongoURI = "TODO: GET FROM .ENV";
        databaseLifecycle.register(new MongoConnector(mongoURI));
        databaseLifecycle.connectAll();
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
