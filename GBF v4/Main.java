package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.IntentHandler;

public class Main {
    public static void main(String[] args) {
        Config config = new Config()
                .version("1.0.0")
                .AutoLogin(true)
                .LogActions(true)
                .IgnoreEventsFromHandler(false)
                .CommandsFolder("org.bunnys.commands")
                .intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS));

        GBF client = new GBF(config);
    }
}