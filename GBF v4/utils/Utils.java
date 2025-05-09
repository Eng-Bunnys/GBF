package org.bunnys.utils;

import net.dv8tion.jda.api.entities.channel.concrete.PrivateChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.utils.messages.MessageCreateData;

import java.util.concurrent.TimeUnit;

public class Utils {
    /***
     * Sends a message to the channel and deletes it after a delay
     *
     * @param channel The channel to send the message to
     * @param messageData The message content and options
     * @param delay The delay in seconds before deleting the message, minimum 1 second
     */
    public static void sendAndDelete(MessageChannel channel, MessageCreateData messageData, long delay) {
        if (channel instanceof PrivateChannel) // To-Do: Handle private channels later
            channel.sendMessage(messageData).queue();
        else {
            channel.sendMessage(messageData).queue(sentMessage -> {
                sentMessage.delete().queueAfter(delay > 1 ? delay : 1, TimeUnit.SECONDS);
            });
        }
    }
}
