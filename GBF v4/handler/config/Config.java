package org.bunnys.handler.config;

import net.dv8tion.jda.api.requests.GatewayIntent;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Config {
    // Handler Features
    private String version;
    private boolean autoLogin;

    // Bot Features
    private String token;
    List<GatewayIntent> intents;

    public Config() {
        /// Default Values
        // Bot Features
        this.token = null;
        this.intents = null; // Default to null since createDefault() will set it to all intents
        // Handler Features
        this.version = "1.0.0";
        this.autoLogin = false;
    }

    /// For Method Chaining

    // Bot Features

    public Config token(String token) {
        this.token = token;
        return this;
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

    /// Getters

    // Bot Features

    public String token() { return token; }

    // Handler Features

    public String version() { return version; }
    public boolean AutoLogin() { return autoLogin; }
    public List<GatewayIntent> intents() { return intents; }
}