package org.bunnys.events;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

public class MessageListener extends ListenerAdapter implements Event {

    private final JBF client;

    public MessageListener(JBF client) {
        this.client = client;
    }

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
        Logger.info("[MessageListener] Registered on shard: " + jda.getShardInfo());
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        // Ignore bot messages
        if (event.getAuthor().isBot()) return;

        Message msg = event.getMessage();
        Logger.info("[MessageListener] Received message from "
                + event.getAuthor().getAsTag()
                + " in #" + event.getChannel().getName()
                + ": " + msg.getContentDisplay());

        // Quick test response
        if (msg.getContentRaw().equalsIgnoreCase("ping")) {
            msg.reply("pong!").queue();
        }
    }
}
