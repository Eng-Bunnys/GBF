package org.bunnys.handler.config;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.utils.Logger;

import java.util.Collections;
import java.util.List;

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

    // Bot Features
    private String token;
    private final List<GatewayIntent> intents;

    public Config() {
        // Default Values
        this.token = null;
        this.intents = Collections.emptyList();
        this.version = "1.0.0";
        this.autoLogin = false;
        this.logActions = false;
        this.eventFolder = null;
        this.ignoreEvents = false;
        this.ignoreEventsFromHandler = false;
        this.commandsFolder = null;
        this.prefix = "!";
    }

    // Builder Pattern for Config
    public static class Builder {
        private String token = null;
        private List<GatewayIntent> intents = Collections.emptyList();
        private String version = "1.0.0";
        private boolean autoLogin = false;
        private boolean logActions = false;
        private String eventFolder = null;
        private boolean ignoreEvents = false;
        private boolean ignoreEventsFromHandler = false;
        private String commandsFolder = null;
        private String prefix = "!";

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder intents(List<GatewayIntent> intents) {
            this.intents = intents != null ? intents : Collections.emptyList();
            return this;
        }

        public Builder version(String version) {
            this.version = version != null ? version : "1.0.0";
            return this;
        }

        public Builder autoLogin(boolean autoLogin) {
            this.autoLogin = autoLogin;
            return this;
        }

        public Builder logActions(boolean logActions) {
            this.logActions = logActions;
            return this;
        }

        public Builder eventFolder(String path) {
            this.eventFolder = path;
            return this;
        }

        public Builder ignoreEvents(boolean ignoreEvents) {
            this.ignoreEvents = ignoreEvents;
            return this;
        }

        public Builder ignoreEventsFromHandler(boolean ignoreEventsFromHandler) {
            this.ignoreEventsFromHandler = ignoreEventsFromHandler;
            return this;
        }

        public Builder commandsFolder(String path) {
            this.commandsFolder = path;
            return this;
        }

        public Builder prefix(String prefix) {
            if (prefix == null || prefix.isBlank()) {
                this.prefix = "!";
                Logger.warning("Prefix cannot be null or blank. Defaulting to '!'");
            } else {
                this.prefix = prefix;
            }
            return this;
        }

        public Config build() {
            return new Config(this);
        }
    }

    private Config(Builder builder) {
        this.token = builder.token;
        this.intents = builder.intents;
        this.version = builder.version;
        this.autoLogin = builder.autoLogin;
        this.logActions = builder.logActions;
        this.eventFolder = builder.eventFolder;
        this.ignoreEvents = builder.ignoreEvents;
        this.ignoreEventsFromHandler = builder.ignoreEventsFromHandler;
        this.commandsFolder = builder.commandsFolder;
        this.prefix = builder.prefix;
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
}