package org.bunnys;

import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        Config config = new Config()
                .version("1.0.0")
                .AutoLogin(true);
//                .intents(List.of(
//                        GatewayIntent.GUILD_MESSAGES,
//                        GatewayIntent.DIRECT_MESSAGES,
//                        GatewayIntent.GUILD_MEMBERS,
//                        GatewayIntent.GUILD_PRESENCES
//                ));

        GBF client = new GBF(config);
    }
}