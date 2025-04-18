package org.bunnys.handler.config;

import net.dv8tion.jda.api.requests.GatewayIntent;

import java.util.Collections;
import java.util.List;

public class Config {
    // Handler Features
    /**
     * The bot's version
     * @default 1.0.0
     * */
    private String version;
    /**
     * Whether the bot should automatically log in or not
     * @default false
     * */
    private boolean autoLogin;
    /**
     * Prints handler actions like commands registered, connected to DB, etc.
     * @default false
     *  */
    private boolean logActions;

    /**
     * The path to the events folder
     * @default  null
     * */
    private String eventFolder;

    /**
     * Stops the handler from loading events
     * @default false
     * */
    private boolean ignoreEvents;

    /**
     * Stops the handler from loading events from the handler
     * @default false
     * */
    private boolean ignoreEventsFromHandler;

    // Bot Features
    private String token;
    List<GatewayIntent> intents;

    public Config() {
        /// Default Values
        // Bot Features
        this.token = null;
        this.intents = Collections.emptyList();
        // Handler Features
        this.version = "1.0.0";
        this.autoLogin = false;
        this.logActions = false;

        this.eventFolder = null;
        this.ignoreEvents = false;
        this.ignoreEventsFromHandler = false;
    }

    /// For Method Chaining

    // Bot Features

    public void token(String token) {
        this.token = token;
    }

    public Config intents(List<GatewayIntent> intents) {
        this.intents = intents;
        return this;
    }

    // Handler Features

    public Config version(String version) {
        this.version = version;
        return this;
    }

    public Config AutoLogin(boolean autoLogin) {
        this.autoLogin = autoLogin;
        return this;
    }

    public Config LogActions(boolean logActions) {
        this.logActions = logActions;
        return this;
    }

    public Config EventFolder(String path) {
        this.eventFolder = path;
        return this;
    }

    public Config IgnoreEvents(boolean ignoreEvents) {
        this.ignoreEvents = ignoreEvents;
        return this;
    }

    public Config IgnoreEventsFromHandler(boolean ignoreEventsFromHandler) {
        this.ignoreEventsFromHandler = ignoreEventsFromHandler;
        return this;
    }

    /// Getters

    // Bot Features

    public String token() { return token; }

    // Handler Features

    public String version() { return version; }
    public boolean AutoLogin() { return autoLogin; }
    public List<GatewayIntent> intents() { return intents; }
    public boolean LogActions() { return logActions; }
    public String EventFolder() { return eventFolder; }
    public boolean IgnoreEvents() { return ignoreEvents; }
    public boolean IgnoreEventsFromHandler() { return ignoreEventsFromHandler; }
}