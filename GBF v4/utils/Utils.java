package org.bunnys.utils;

import net.dv8tion.jda.api.entities.channel.concrete.PrivateChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.utils.messages.MessageCreateData;

import java.util.concurrent.TimeUnit;
import java.util.Arrays;
import java.util.stream.Collectors;

public class Utils {
    /**
     * Sends a message to the channel and deletes it after a delay
     *
     * @param channel     The channel to send the message to
     * @param messageData The message content and options
     * @param delay       The delay in seconds before deleting the message, minimum 1 second
     */
    public static void sendAndDelete(MessageChannel channel, MessageCreateData messageData, long delay) {
        if (channel instanceof PrivateChannel) {
            channel.sendMessage(messageData).queue();
        } else {
            channel.sendMessage(messageData).queue(sentMessage ->
                    sentMessage.delete().queueAfter(Math.max(1, delay), TimeUnit.SECONDS)
            );
        }
    }

    /**
     * Converts a string to title case, capitalizing the first letter of each word.
     * Words are assumed to be separated by underscores or spaces.
     * Example: "KICK_MEMBERS" -> "Kick Members"
     *
     * @param input The input string to convert
     * @return The title-cased string
     */
    public static String toTitleCase(String input) {
        if (input == null || input.isBlank())
            return input;

        return Arrays.stream(input.toLowerCase().split("[_\\s]+"))
                .map(word -> word.isEmpty() ? word :
                        Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }
}