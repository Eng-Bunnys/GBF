package org.bunnys.handler.events.defaults;

import com.github.lalyos.jfiglet.FigletFont;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.session.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.handler.colors.ConsoleColors;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.io.IOException;
import java.util.Arrays;

public class ClientReady extends ListenerAdapter implements Event {
    private final BunnyNexus client;

    public ClientReady(BunnyNexus client) {
        this.client = client;
    }

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onReady(ReadyEvent event) {
        final String clientName = event.getJDA().getSelfUser().getName();
        final String asciiArt = renderASCII(clientName);

        final String[] lines = asciiArt.split("\n");
        final int maxLength = Arrays.stream(lines)
                .mapToInt(String::length)
                .max()
                .orElse(clientName.length());

        final String underline = "_".repeat(maxLength);

        System.out.println(ConsoleColors.RED + asciiArt + underline + ConsoleColors.RESET);
        System.out.println("• " + clientName + " v" + this.client.getConfig().version());
    }

    /**
     * Render ASCII safely; fallback to plain text if figlet fails
     */
    private String renderASCII(String text) {
        try {
            return FigletFont.convertOneLine(text);
        } catch (IOException e) {
            Logger.warning(
                    "[ClientReady] Failed to render ASCII art. Falling back to plain text\nError: " + e.getMessage());
            return text;
        }
    }
}
