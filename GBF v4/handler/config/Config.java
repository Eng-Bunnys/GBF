package org.bunnys.handler.config;

import net.dv8tion.jda.api.entities.UserSnowflake;
import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.utils.Logger;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Configuration class for the GBF Handler, optimized for immutability, thread-safety, and validation.
 * Uses a builder pattern for flexible instantiation and provides default values for all fields.
 * Maintains original method names for compatibility.
 */
public class Config {
    // Handler Features
    private final String version;
    private final boolean autoLogin;
    private final boolean logActions;
    private final String eventFolder;
    private final boolean ignoreEvents;
    private final boolean ignoreEventsFromHandler;
    private final String commandsFolder;
    private final String prefix;
    private final List<UserSnowflake> developers;
    private final int timeoutSeconds;
    private final int retries;

    // Bot Features
    private volatile String token; // Only mutable field, thread-safe
    private final List<GatewayIntent> intents;

    // Default values
    private static final String DEFAULT_VERSION = "1.0.0";
    private static final String DEFAULT_PREFIX = "!";
    private static final int DEFAULT_TIMEOUT_SECONDS = 10;
    private static final int DEFAULT_RETRIES = 3;

    private Config(Builder builder) {
        this.token = builder.token;
        this.intents = List.copyOf(Objects.requireNonNullElse(builder.intents, Collections.emptyList()));
        this.version = Objects.requireNonNullElse(builder.version, DEFAULT_VERSION);
        this.autoLogin = builder.autoLogin;
        this.logActions = builder.logActions;
        this.eventFolder = builder.eventFolder;
        this.ignoreEvents = builder.ignoreEvents;
        this.ignoreEventsFromHandler = builder.ignoreEventsFromHandler;
        this.commandsFolder = builder.commandsFolder;
        this.prefix = Objects.requireNonNullElse(builder.prefix, DEFAULT_PREFIX);
        this.developers = List.copyOf(Objects.requireNonNullElse(builder.developers, Collections.emptyList()));
        this.timeoutSeconds = builder.timeoutSeconds > 0 ? builder.timeoutSeconds : DEFAULT_TIMEOUT_SECONDS;
        this.retries = builder.retries > 0 ? builder.retries : DEFAULT_RETRIES;
    }

    // Builder Pattern for Config
    public static class Builder {
        private String token = null;
        private List<GatewayIntent> intents = Collections.emptyList();
        private String version = DEFAULT_VERSION;
        private boolean autoLogin = false;
        private boolean logActions = false;
        private String eventFolder = null;
        private boolean ignoreEvents = false;
        private boolean ignoreEventsFromHandler = false;
        private String commandsFolder = null;
        private String prefix = DEFAULT_PREFIX;
        private List<UserSnowflake> developers = Collections.emptyList();
        private int timeoutSeconds = DEFAULT_TIMEOUT_SECONDS;
        private int retries = DEFAULT_RETRIES;

        public Builder Token(String token) {
            this.token = token;
            return this;
        }

        public Builder Intents(List<GatewayIntent> intents) {
            this.intents = intents;
            return this;
        }

        public Builder Version(String version) {
            this.version = version;
            return this;
        }

        public Builder AutoLogin(boolean autoLogin) {
            this.autoLogin = autoLogin;
            return this;
        }

        public Builder LogActions(boolean logActions) {
            this.logActions = logActions;
            return this;
        }

        public Builder EventFolder(String path) {
            this.eventFolder = path;
            return this;
        }

        public Builder IgnoreEvents(boolean ignoreEvents) {
            this.ignoreEvents = ignoreEvents;
            return this;
        }

        public Builder IgnoreEventsFromHandler(boolean ignoreEventsFromHandler) {
            this.ignoreEventsFromHandler = ignoreEventsFromHandler;
            return this;
        }

        public Builder CommandsFolder(String path) {
            this.commandsFolder = path;
            return this;
        }

        public Builder Prefix(String prefix) {
            if (prefix == null || prefix.isBlank()) {
                Logger.warning("Prefix cannot be null or blank. Defaulting to '" + DEFAULT_PREFIX + "'");
                this.prefix = DEFAULT_PREFIX;
            } else {
                this.prefix = prefix;
            }
            return this;
        }

        public Builder Developers(List<UserSnowflake> developers) {
            this.developers = developers;
            return this;
        }

        public Builder TimeoutSeconds(int timeoutSeconds) {
            this.timeoutSeconds = timeoutSeconds;
            return this;
        }

        public Builder Retries(int retries) {
            this.retries = retries;
            return this;
        }

        public Config Build() {
            return new Config(this);
        }
    }

    // Setter for token (only mutable field)
    public void token(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token cannot be null or blank.");
        }
        this.token = token;
    }

    // Getters
    public String token() {
        return token;
    }

    public List<GatewayIntent> intents() {
        return intents;
    }

    public String version() {
        return version;
    }

    public boolean AutoLogin() {
        return autoLogin;
    }

    public boolean LogActions() {
        return logActions;
    }

    public String EventFolder() {
        return eventFolder;
    }

    public boolean IgnoreEvents() {
        return ignoreEvents;
    }

    public boolean IgnoreEventsFromHandler() {
        return ignoreEventsFromHandler;
    }

    public String CommandsFolder() {
        return commandsFolder;
    }

    public String Prefix() {
        return prefix;
    }

    public List<UserSnowflake> Developers() {
        return developers;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public int getRetries() {
        return retries;
    }

    public int getTimeoutSeconds(int defaultValue) {
        return timeoutSeconds > 0 ? timeoutSeconds : defaultValue;
    }

    public int getRetries(int defaultValue) {
        return retries > 0 ? retries : defaultValue;
    }
}