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
                .LogActions(false)
                .IgnoreEvents(false)
                .CommandsFolder("org.bunnys.commands")
                .Intents(IntentHandler.fromRaw(GatewayIntent.ALL_INTENTS))
              //  .developers(List.of(UserSnowflake.fromId("333644367539470337")))
                .Build();

        @SuppressWarnings("unused")
        GBF client = new GBF(config);
    }
}