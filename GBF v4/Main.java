package org.bunnys;

import net.dv8tion.jda.api.entities.UserSnowflake;
import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.IntentHandler;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        Config config = new Config.Builder()
                .version("1.0.0")
                .autoLogin(true)
                .logActions(true)
                .ignoreEvents(false)
                .commandsFolder("org.bunnys.commands")
                .intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
                .developers(List.of(UserSnowflake.fromId("333644367539470337")))
                .build();

        @SuppressWarnings("unused")
        GBF client = new GBF(config);
    }
}