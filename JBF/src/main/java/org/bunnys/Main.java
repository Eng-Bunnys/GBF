package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.Config;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.utils.handler.IntentHandler;

@SuppressWarnings("unused")
public class Main {
    public static void main(String[] args) {
        Config config = Config.builder()
                .version("2.0.0")
                .debug(true)
                .intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
                .prefix("!!")
                .developers("333644367539470337", "776580152163303445")
                .testServers("1187559385359200316")
                .eventsPackage("org.bunnys.events")
                .commandsPackage("org.bunnys.commands")
                .build();

        BunnyNexus client = new BunnyNexus(config);
    }
}