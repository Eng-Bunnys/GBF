package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.IntentHandler;

public class Main {
    public static void main(String[] args) {
        Config config = new Config.Builder()
                .version("1.0.0")
                .autoLogin(true)
                .logActions(true)
                .ignoreEvents(false)
                .commandsFolder("org.bunnys.commands")
                .intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
                .build();

        @SuppressWarnings("unused")
        GBF client = new GBF(config);
    }
}