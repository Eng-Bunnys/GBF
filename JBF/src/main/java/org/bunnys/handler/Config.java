package org.bunnys.handler;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.events.defaults.DefaultEvents;
import org.bunnys.handler.utils.handler.EnvLoader;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.EnumSet;
import java.util.Objects;

@SuppressWarnings("unused")
public class Config {
    /** The bot's version */
    private final String version;

    /** Command prefix (Default: !) */
    private final String prefix;

    /** The bot's developer IDs */
    private final String[] developers;

    /** Test servers for slash command registration */
    private final String[] testServers;

    /** Whether to automatically login on BunnyNexus init */
    private final boolean autoLogin;

    /** Show debug logs or not */
    private final boolean debug;

    /** The number of shards to use (0 = auto-sharding) */
    private final int shardCount;

    /** Package to scan for Event handlers (e.g., "org.bunnys.events") */
    private final String eventsPackage;

    /** The DefaultEvents to disable */
    private final EnumSet<DefaultEvents> disabledDefaults;

    /** Package to scan for Commands (e.g., "org.bunnys.commands") */
    private final String commandsPackage;

    /** The GatewayIntents/Intents to enable */
    private final EnumSet<GatewayIntent> intents;

    /** The bot token, resolved from .env or provided manually */
    private volatile String token;

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
    }

    // Getters
    public String version() {
        return this.version;
    }

    public String prefix() {
        return this.prefix;
    }

    public boolean debug() {
        return this.debug;
    }

    public int shardCount() {
        return this.shardCount;
    }

    public String token() {
        return this.token;
    }

    public String eventsPackage() {
        return this.eventsPackage;
    }

    public String commandsPackage() {
        return this.commandsPackage;
    }

    public String[] developers() {
        return this.developers != null ? this.developers.clone() : new String[0];
    }

    public String[] testServers() {
        return this.testServers != null ? this.testServers.clone() : new String[0];
    }

    public EnumSet<DefaultEvents> disabledDefaults() {
        return this.disabledDefaults != null
                ? EnumSet.copyOf(this.disabledDefaults)
                : EnumSet.noneOf(DefaultEvents.class);
    }

    public EnumSet<GatewayIntent> intents() {
        return intents.isEmpty()
                ? EnumSet.noneOf(GatewayIntent.class)
                : EnumSet.copyOf(intents);
    }

    public boolean autoLogin() {
        return this.autoLogin;
    }

    /** Package-private: only BunnyNexus should call this at runtime */
    void token(String token) {
        if (token == null || token.isBlank())
            throw new IllegalArgumentException("Token must be a valid string");

        Logger.warning("Token updated at runtime.");
        this.token = token;
    }

    private String resolveToken(String token) {
        // Manual token
        if (token != null && !token.isBlank()) {
            if (this.debug)
                Logger.info("Using manually provided bot token");
            return token;
        }

        // Else, try .env
        if (this.debug)
            Logger.info("No manual token provided, attempting to load from .env under \"TOKEN\"");
        String envToken = EnvLoader.get("TOKEN");

        if (envToken != null && !envToken.isBlank()) {
            Logger.success("Loaded bot token from .env");
            return envToken;
        }

        // Nothing found
        throw new IllegalStateException("No bot token provided and .env does not contain a valid TOKEN key");
    }

    public static Builder builder() {
        return new Builder();
    }

    // ---- Builder ----
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

        public Builder version(String version) {
            if (version == null || version.isBlank())
                throw new IllegalStateException("Config.version must be a valid string");
            this.version = version;
            return this;
        }

        public Builder prefix(String prefix) {
            if (prefix == null || prefix.isBlank())
                throw new IllegalArgumentException("Prefix must be a valid string");
            this.prefix = prefix;
            return this;
        }

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

        public Builder debug(boolean debug) {
            this.debug = debug;
            return this;
        }

        public Builder autoLogin(boolean autoLogin) {
            this.autoLogin = autoLogin;
            return this;
        }

        public Builder token(String token) {
            this.token = token; // fallback handled
            return this;
        }

        /** Example: "org.bunnys.events" */
        public Builder eventsPackage(String eventsPackage) {
            this.eventsPackage = eventsPackage;
            return this;
        }

        /** Example: "org.bunnys.commands" */
        public Builder commandsPackage(String commandsPackage) {
            this.commandsPackage = commandsPackage;
            return this;
        }

        public Builder disableDefaultEvents(EnumSet<DefaultEvents> events) {
            this.disabledDefaultEvents = events != null
                    ? EnumSet.copyOf(events)
                    : EnumSet.noneOf(DefaultEvents.class);
            return this;
        }

        public Builder shardCount(int shardCount) {
            if (shardCount < 0) // allow 0 for auto-sharding
                throw new IllegalArgumentException("Shard count must be >= 0");
            this.shardCount = shardCount;
            return this;
        }

        public Builder intents(EnumSet<GatewayIntent> intents) {
            this.intents = intents != null
                    ? EnumSet.copyOf(intents)
                    : EnumSet.noneOf(GatewayIntent.class);
            return this;
        }

        public Config build() {
            return new Config(this);
        }
    }

    @Override
    public String toString() {
        return "Config{version='" + version + "', shards=" + shardCount + ", eventsPackage='" + eventsPackage + "'}";
    }
}
