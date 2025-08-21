package org.bunnys.events;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.session.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

public class ClientReady extends ListenerAdapter implements Event {

    private final JBF client;

    public ClientReady(JBF client) {
        this.client = client;
    }

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
        Logger.info("[ClientReady] Registered on shard: " + jda.getShardInfo());
    }

    @Override
    public void onReady(ReadyEvent event) {
        String botName = event.getJDA().getSelfUser().getName();
        Logger.success("Bot is ready! Name: " + botName + " | Shard: " + event.getJDA().getShardInfo());
    }
}
