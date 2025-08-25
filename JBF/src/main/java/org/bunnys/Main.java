package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.events.defaults.DefaultEvents;
import org.bunnys.handler.utils.IntentHandler;

import java.util.EnumSet;

public class Main {
    public static void main(String[] args) {
        Config config = Config.builder()
                .version("2.0.0")
                .debug(true)
                .disableDefaultEvents(EnumSet.of(DefaultEvents.CLIENT_READY))
                .intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
                .eventsPackage("org.bunnys.events")
                .build();

        JBF client = new JBF(config);
    }
}