package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.utils.IntentHandler;

public class Main {
    public static void main(String[] args) {
        Config config = Config.builder()
                .version("2.0.0")
                .debug(true)
                .intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
                .eventsPackage("org.bunnys.events")
                .build();

        JBF client = new JBF(config);
    }
}