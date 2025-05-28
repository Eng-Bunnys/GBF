package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.IntentHandler;

public class Main {
    public static void main(String[] args) {
        Config config = new Config.Builder()
                .Version("1.0.0")
                .AutoLogin(true)
                .LogActions(true)
                .IgnoreEvents(false)
                .CommandsFolder("org.bunnys.commands")
                .Intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
                .Prefix("!!")
                .Retries(5)
                .TimeoutSeconds(30)
                .Build();

        @SuppressWarnings("unused")
        GBF client = new GBF(config);
    }
}