package org.bunnys.handler;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.EnvLoader;

import java.util.List;

public class GBF {
    public Config config;

    public GBF(Config config) {
        this.config = config;
        System.out.println("Handler online");

        this.config.token(this.getToken());

        if (this.config.AutoLogin())
            try {
                this.login();
            } catch (InterruptedException err) {
                System.out.println("Error logging in\n" + err.getMessage());
            }
    }

    public void login() throws InterruptedException {
        try {
            List<GatewayIntent> intents = this.config.intents();

            List<GatewayIntent> specifiedIntents = this.config.intents();

            JDA builder = JDABuilder.createDefault(this.config.token())
                    .enableIntents(specifiedIntents)
                    .build();

            System.out.println(intents);

            builder.awaitReady();

            System.out.println(builder.getSelfUser().getName() + " is now online!");
        } catch (InterruptedException err) {
            System.out.println("Error logging in\n" + err.getMessage());
        } catch (Exception err) {
            System.out.println("Error waiting for bot to be ready\n" + err.getMessage());
        }
    }

    private String getToken() {
        return EnvLoader.get("TOKEN");
    }
}
