package org.bunnys.handler;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.database.DatabaseConfig;
import org.bunnys.handler.database.DatabaseType;
import org.bunnys.handler.database.config.MongoConfig;
import org.bunnys.handler.database.config.NoneConfig;
import org.bunnys.handler.database.config.OtherConfig;
import org.bunnys.handler.database.config.SQLConfig;
import org.bunnys.handler.events.defaults.DefaultEvents;
import org.bunnys.handler.utils.handler.EnvLoader;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.EnumSet;
import java.util.Objects;

/**
 * A comprehensive configuration object for the BunnyNexus bot, implemented
 * using the
 * <a href="https://refactoring.guru/design-patterns/builder">Builder
 * pattern</a>.
 * This class encapsulates all necessary settings, from bot token and command
 * prefixes to database configurations and event handling packages.
 * <p>
 * This immutable class ensures that all configuration settings are correctly
 * initialized upon creation and cannot be modified externally, promoting
 * thread safety and predictable behavior. The {@link Builder} inner class
 * provides
 * a fluent API for constructing a {@code Config} instance, simplifying the
 * setup
 * process and improving readability.
 *
 * @author Bunny
 */
@SuppressWarnings("unused")
public class Config {
    /** The bot's version identifier. */
    private final String version;

    /** The command prefix used for text commands (Default: !). */
    private final String prefix;

    /** An array of user IDs designated as bot developers. */
    private final String[] developers;

    /** An array of guild IDs to be used for testing and development. */
    private final String[] testServers;

    /**
     * A boolean flag indicating whether the bot should automatically log in on
     * initialization.
     */
    private final boolean autoLogin;

    /** A boolean flag to enable or disable debug logging. */
    private final boolean debug;

    /**
     * The number of shards to use for scaling. A value of 0 indicates
     * auto-sharding.
     */
    private final int shardCount;

    /** The root package to scan for event handler classes. */
    private final String eventsPackage;

    /** A set of default events that should be disabled. */
    private final EnumSet<DefaultEvents> disabledDefaults;

    /** The root package to scan for command classes. */
    private final String commandsPackage;

    /** A set of GatewayIntents that the bot will subscribe to. */
    private final EnumSet<GatewayIntent> intents;

    /** The configuration object for the selected database. */
    private final DatabaseConfig databaseConfig;

    /**
     * A boolean flag to determine whether a database connection should be
     * established.
     */
    private final boolean connectToDatabase;

    /**
     * The bot's authentication token.
     * This field is marked {@code volatile} to ensure visibility across threads,
     * particularly when the token is updated at runtime.
     */
    private volatile String token;

    /**
     * Constructs a new {@code Config} instance from a {@link Builder}.
     * This constructor is private to enforce the use of the builder pattern.
     *
     * @param builder The {@link Builder} instance containing the desired
     *                configuration.
     * @throws NullPointerException if the version is null.
     */
    private Config(Builder builder) {
        this.token = this.resolveToken(builder.token);
        this.version = Objects.requireNonNull(builder.version, "Version must not be null");
        this.developers = builder.developers != null ? builder.developers.clone() : new String[0];
        this.testServers = builder.testServers != null ? builder.testServers.clone() : new String[0];
        this.prefix = builder.prefix;
        this.eventsPackage = builder.eventsPackage;
        this.commandsPackage = builder.commandsPackage;
        this.disabledDefaults = builder.disabledDefaultEvents != null
                ? EnumSet.copyOf(builder.disabledDefaultEvents)
                : EnumSet.noneOf(DefaultEvents.class);
        this.shardCount = builder.shardCount;
        this.debug = builder.debug;
        this.autoLogin = builder.autoLogin;
        this.intents = builder.intents != null
                ? EnumSet.copyOf(builder.intents)
                : EnumSet.noneOf(GatewayIntent.class);
        this.databaseConfig = builder.databaseConfig != null
                ? builder.databaseConfig
                : new NoneConfig();
        this.connectToDatabase = builder.connectToDatabase;
    }

    // --- Getters ---

    /**
     * Retrieves the bot's version.
     *
     * @return The version string.
     */
    public String version() {
        return this.version;
    }

    /**
     * Retrieves the bot's command prefix.
     *
     * @return The prefix string.
     */
    public String prefix() {
        return this.prefix;
    }

    /**
     * Checks if debug logging is enabled.
     *
     * @return {@code true} if debug is enabled, otherwise {@code false}.
     */
    public boolean debug() {
        return this.debug;
    }

    /**
     * Retrieves the configured shard count.
     *
     * @return The number of shards.
     */
    public int shardCount() {
        return this.shardCount;
    }

    /**
     * Retrieves the bot's authentication token.
     *
     * @return The token string.
     */
    public String token() {
        return this.token;
    }

    /**
     * Retrieves the package name for event handlers.
     *
     * @return The event package name.
     */
    public String eventsPackage() {
        return this.eventsPackage;
    }

    /**
     * Retrieves the package name for commands.
     *
     * @return The command package name.
     */
    public String commandsPackage() {
        return this.commandsPackage;
    }

    /**
     * Checks if a database connection should be attempted.
     *
     * @return {@code true} if a database connection is configured, otherwise
     *         {@code false}.
     */
    public boolean connectToDatabase() {
        return this.connectToDatabase;
    }

    /**
     * Retrieves an array of developer IDs.
     * A new array is returned to prevent external modification of the internal
     * state.
     *
     * @return A defensive copy of the developer IDs array.
     */
    public String[] developers() {
        return this.developers != null ? this.developers.clone() : new String[0];
    }

    /**
     * Retrieves an array of test server IDs.
     * A new array is returned to prevent external modification.
     *
     * @return A defensive copy of the test server IDs array.
     */
    public String[] testServers() {
        return this.testServers != null ? this.testServers.clone() : new String[0];
    }

    /**
     * Retrieves an {@link EnumSet} of disabled default events.
     * A new set is returned to prevent external modification.
     *
     * @return A defensive copy of the set of disabled default events.
     */
    public EnumSet<DefaultEvents> disabledDefaults() {
        return this.disabledDefaults != null
                ? EnumSet.copyOf(this.disabledDefaults)
                : EnumSet.noneOf(DefaultEvents.class);
    }

    /**
     * Retrieves an {@link EnumSet} of enabled GatewayIntents.
     * A new set is returned to prevent external modification.
     *
     * @return A defensive copy of the set of intents.
     */
    public EnumSet<GatewayIntent> intents() {
        return intents.isEmpty()
                ? EnumSet.noneOf(GatewayIntent.class)
                : EnumSet.copyOf(intents);
    }

    /**
     * Checks if automatic login is enabled.
     *
     * @return {@code true} if auto-login is enabled, otherwise {@code false}.
     */
    public boolean autoLogin() {
        return this.autoLogin;
    }

    /**
     * Retrieves the database configuration object.
     *
     * @return The {@link DatabaseConfig} instance.
     */
    public DatabaseConfig databaseConfig() {
        return this.databaseConfig;
    }

    /**
     * Sets the bot's authentication token at runtime.
     * This method is intended for internal use by the BunnyNexus framework
     * and is package-private.
     *
     * @param token The new token string.
     * @throws IllegalArgumentException if the token is null or blank.
     */
    void token(String token) {
        if (token == null || token.isBlank())
            throw new IllegalArgumentException("Token must be a valid string");

        Logger.warning("Token updated at runtime.");
        this.token = token;
    }

    /**
     * Resolves the bot token, first attempting to use a manually provided token,
     * and falling back to loading from an environment variable named "TOKEN" in a
     * .env file.
     *
     * @param token The manually provided token, which can be null or blank.
     * @return The resolved token string.
     * @throws IllegalStateException if no valid token is found.
     */
    private String resolveToken(String token) {
        // Use manually provided token if available
        if (token != null && !token.isBlank()) {
            if (this.debug)
                Logger.info("Using manually provided bot token");
            return token;
        }

        // Fallback to environment variable
        if (this.debug)
            Logger.info("No manual token provided, attempting to load from .env under \"TOKEN\"");
        String envToken = EnvLoader.get("TOKEN");

        if (envToken != null && !envToken.isBlank()) {
            Logger.success("Loaded bot token from .env");
            return envToken;
        }

        // Token not found
        throw new IllegalStateException("No bot token provided and .env does not contain a valid TOKEN key");
    }

    /**
     * Provides a new {@link Builder} instance for creating a {@code Config} object.
     *
     * @return A new {@link Builder}.
     */
    public static Builder builder() {
        return new Builder();
    }

    // --- Builder Class ---
    /**
     * The builder class for {@link Config}.
     * Provides a fluent API to construct and configure a {@code Config} instance.
     */
    @SuppressWarnings("unused")
    public static final class Builder {
        private String token;
        private String version;
        private String[] developers = new String[0];
        private String[] testServers = new String[0];
        private String prefix = "!"; // default
        private boolean autoLogin = true;
        private boolean debug = false;
        private int shardCount = 0; // 0 = auto-sharding
        private String eventsPackage;
        private String commandsPackage;
        private EnumSet<DefaultEvents> disabledDefaultEvents = EnumSet.noneOf(DefaultEvents.class);
        private EnumSet<GatewayIntent> intents = EnumSet.noneOf(GatewayIntent.class);
        private DatabaseConfig databaseConfig = null;
        private boolean connectToDatabase = false;

        /**
         * Sets the bot's version.
         *
         * @param version The version string.
         * @return The current builder instance for method chaining.
         * @throws IllegalStateException if the version is null or blank.
         */
        public Builder version(String version) {
            if (version == null || version.isBlank())
                throw new IllegalStateException("Config.version must be a valid string");
            this.version = version;
            return this;
        }

        /**
         * Sets whether the bot should connect to a database.
         *
         * @param connectToDatabase {@code true} to enable database connection,
         *                          {@code false} otherwise.
         * @return The current builder instance.
         */
        public Builder connectToDatabase(boolean connectToDatabase) {
            this.connectToDatabase = connectToDatabase;
            return this;
        }

        /**
         * Sets the command prefix.
         *
         * @param prefix The command prefix.
         * @return The current builder instance.
         * @throws IllegalArgumentException if the prefix is null or blank.
         */
        public Builder prefix(String prefix) {
            if (prefix == null || prefix.isBlank())
                throw new IllegalArgumentException("Prefix must be a valid string");
            this.prefix = prefix;
            return this;
        }

        /**
         * Sets the bot's developer IDs.
         *
         * @param developers An array of developer IDs.
         * @return The current builder instance.
         * @throws IllegalArgumentException if any developer ID is null or blank.
         */
        public Builder developers(String... developers) {
            if (developers == null || developers.length == 0) {
                this.developers = new String[0];
                return this;
            }
            for (int i = 0; i < developers.length; i++) {
                if (developers[i] == null || developers[i].isBlank())
                    throw new IllegalArgumentException("Developer IDs must be valid strings");
                developers[i] = developers[i].trim();
            }
            this.developers = developers;
            return this;
        }

        /**
         * Sets the IDs of test servers for command registration.
         *
         * @param testServers An array of test server IDs.
         * @return The current builder instance.
         * @throws IllegalArgumentException if any test server ID is null or blank.
         */
        public Builder testServers(String... testServers) {
            if (testServers == null || testServers.length == 0) {
                this.testServers = new String[0];
                return this;
            }
            for (int i = 0; i < testServers.length; i++) {
                if (testServers[i] == null || testServers[i].isBlank())
                    throw new IllegalArgumentException("Test server IDs must be valid strings");
                testServers[i] = testServers[i].trim();
            }
            this.testServers = testServers;
            return this;
        }

        /**
         * Sets the debug logging flag.
         *
         * @param debug {@code true} to enable debug logging, {@code false} otherwise.
         * @return The current builder instance.
         */
        public Builder debug(boolean debug) {
            this.debug = debug;
            return this;
        }

        /**
         * Sets the automatic login flag.
         *
         * @param autoLogin {@code true} to enable automatic login, {@code false}
         *                  otherwise.
         * @return The current builder instance.
         */
        public Builder autoLogin(boolean autoLogin) {
            this.autoLogin = autoLogin;
            return this;
        }

        /**
         * Sets the bot's authentication token.
         * If the token is null or blank, the builder will attempt to load it from the
         * .env file.
         *
         * @param token The bot token.
         * @return The current builder instance.
         */
        public Builder token(String token) {
            this.token = token;
            return this;
        }

        /**
         * Sets the root package to scan for event handler classes.
         *
         * @param eventsPackage The package name (e.g., "org.bunnys.events").
         * @return The current builder instance.
         */
        public Builder eventsPackage(String eventsPackage) {
            this.eventsPackage = eventsPackage;
            return this;
        }

        /**
         * Sets the root package to scan for command classes.
         *
         * @param commandsPackage The package name (e.g., "org.bunnys.commands").
         * @return The current builder instance.
         */
        public Builder commandsPackage(String commandsPackage) {
            this.commandsPackage = commandsPackage;
            return this;
        }

        /**
         * Sets the default events to be disabled.
         *
         * @param events An {@link EnumSet} of {@link DefaultEvents} to disable.
         * @return The current builder instance.
         */
        public Builder disableDefaultEvents(EnumSet<DefaultEvents> events) {
            this.disabledDefaultEvents = events != null
                    ? EnumSet.copyOf(events)
                    : EnumSet.noneOf(DefaultEvents.class);
            return this;
        }

        /**
         * Sets the number of shards for the bot.
         * A value of 0 indicates that JDA's auto-sharding feature should be used.
         *
         * @param shardCount The number of shards.
         * @return The current builder instance.
         * @throws IllegalArgumentException if the shard count is negative.
         */
        public Builder shardCount(int shardCount) {
            if (shardCount < 0)
                throw new IllegalArgumentException("Shard count must be >= 0");
            this.shardCount = shardCount;
            return this;
        }

        /**
         * Sets the GatewayIntents for the bot.
         *
         * @param intents An {@link EnumSet} of {@link GatewayIntent}s.
         * @return The current builder instance.
         */
        public Builder intents(EnumSet<GatewayIntent> intents) {
            this.intents = intents != null
                    ? EnumSet.copyOf(intents)
                    : EnumSet.noneOf(GatewayIntent.class);
            return this;
        }

        /**
         * Configures the bot to use a MongoDB database.
         *
         * @param uri The MongoDB connection URI.
         * @return The current builder instance.
         */
        public Builder mongo(String uri) {
            this.databaseConfig = new MongoConfig(uri);
            return this;
        }

        /**
         * Configures the bot to use a MySQL database.
         *
         * @param uri  The MySQL connection URI.
         * @param name The database name.
         * @return The current builder instance.
         */
        public Builder mysql(String uri, String name) {
            this.databaseConfig = new SQLConfig(DatabaseType.MYSQL, uri, name);
            return this;
        }

        /**
         * Configures the bot to use a PostgreSQL database.
         *
         * @param uri  The PostgreSQL connection URI.
         * @param name The database name.
         * @return The current builder instance.
         */
        public Builder postgres(String uri, String name) {
            this.databaseConfig = new SQLConfig(DatabaseType.POSTGRESQL, uri, name);
            return this;
        }

        /**
         * Configures the bot to use an SQLite database.
         *
         * @param uri  The SQLite connection URI.
         * @param name The database name.
         * @return The current builder instance.
         */
        public Builder sqlite(String uri, String name) {
            this.databaseConfig = new SQLConfig(DatabaseType.SQLITE, uri, name);
            return this;
        }

        /**
         * Configures the bot to use an "other" database type.
         *
         * @param uri The connection URI for the database.
         * @return The current builder instance.
         */
        public Builder otherDb(String uri) {
            this.databaseConfig = new OtherConfig(uri);
            return this;
        }

        /**
         * Builds and returns a new {@link Config} instance.
         *
         * @return A fully configured {@code Config} object.
         * @throws IllegalArgumentException if {@code connectToDatabase} is true but no
         *                                  database
         *                                  configuration has been provided.
         */
        public Config build() {
            if (connectToDatabase && databaseConfig == null)
                throw new IllegalArgumentException("Connect to Database is true but no Database Config was provided");
            return new Config(this);
        }
    }

    /**
     * Returns a string representation of the configuration, useful for debugging.
     * The token is not included for security reasons.
     *
     * @return A string representation of the configuration.
     */
    @Override
    public String toString() {
        return "Config{version='" + version + "', shards=" + shardCount + ", eventsPackage='" + eventsPackage + "'}";
    }
}