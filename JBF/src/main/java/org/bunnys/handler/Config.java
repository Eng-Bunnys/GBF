package org.bunnys.handler;

import org.bunnys.handler.utils.EnvLoader;
import org.bunnys.handler.utils.Logger;

import java.util.Objects;

public class Config {

    /** The bot's version */
    private final String version;

    /** Show debug logs or not */
    private final boolean debug;

    /** The number of shards to use (0 = auto-sharding) */
    private final int shardCount;

    /** Package to scan for Event handlers (e.g., "org.bunnys.events") */
    private final String eventsPackage;

    /** The bot token, resolved from .env or provided manually */
    private volatile String token;

    private Config(Builder builder) {
        this.token = this.resolveToken(builder.token);
        this.version = Objects.requireNonNull(builder.version, "Version must not be null");
        this.eventsPackage = builder.eventsPackage;
        this.shardCount = builder.shardCount;
        this.debug = builder.debug;
    }

    // Getters
    public String version()      { return this.version; }
    public boolean debug()       { return this.debug; }
    public int shardCount()      { return this.shardCount; }
    public String token()        { return this.token; }
    public String eventsPackage(){ return this.eventsPackage; }

    /** Package-private: only JBF should call this at runtime */
    void token(String token) {
        if (token == null || token.isBlank())
            throw new IllegalArgumentException("Token must be a valid string");

        Logger.warning("Token updated at runtime.");
        this.token = token;
    }

    private String resolveToken(String token) {
        // Manual token
        if (token != null && !token.isBlank()) {
            Logger.info("Using manually provided bot token");
            return token;
        }

        // Else, try .env
        Logger.info("No manual token provided, attempting to load from .env under \"TOKEN\"");
        String envToken = EnvLoader.get("TOKEN");

        if (envToken != null && !envToken.isBlank()) {
            Logger.success("Loaded bot token from .env");
            return envToken;
        }

        // Nothing found
        throw new IllegalStateException("No bot token provided and .env does not contain a valid TOKEN key");
    }

    public static Builder builder() { return new Builder(); }

    // ---- Builder ----
    public static final class Builder {
        private String token;
        private String version;
        private boolean debug;
        private int shardCount = 0; // 0 = auto-sharding
        private String eventsPackage;

        public Builder version(String version) {
            if (version == null || version.isBlank())
                throw new IllegalStateException("Config.version must be a valid string");
            this.version = version;
            return this;
        }

        public Builder debug(boolean debug) {
            this.debug = debug;
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

        public Builder shardCount(int shardCount) {
            if (shardCount < 0) // allow 0 for auto-sharding
                throw new IllegalArgumentException("Shard count must be >= 0");
            this.shardCount = shardCount;
            return this;
        }

        public Config build() { return new Config(this); }
    }

    @Override
    public String toString() {
        return "Config{version='" + version + "', shards=" + shardCount + ", eventsPackage='" + eventsPackage + "'}";
    }
}
