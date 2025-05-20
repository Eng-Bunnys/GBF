package org.bunnys.handler.config;

import net.dv8tion.jda.api.entities.UserSnowflake;
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
    private final List<UserSnowflake> developers;

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
        this.developers = Collections.emptyList();
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
        private List<UserSnowflake> developers = Collections.emptyList();

        public Builder Token(String token) {
            this.token = token;
            return this;
        }

        public Builder Intents(List<GatewayIntent> intents) {
            this.intents = intents != null ? intents : Collections.emptyList();
            return this;
        }

        public Builder Version(String version) {
            this.version = version != null ? version : "1.0.0";
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
                this.prefix = "!";
                Logger.warning("Prefix cannot be null or blank. Defaulting to '!'");
            } else {
                this.prefix = prefix;
            }
            return this;
        }

        public Builder Developers(List<UserSnowflake> developers) {
            this.developers = developers != null ? developers : Collections.emptyList();
            return this;
        }

        public Config Build() {
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
        this.developers = builder.developers;
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
}