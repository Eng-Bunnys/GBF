package org.bunnys.handler.events.defaults;

import com.github.lalyos.jfiglet.FigletFont;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.session.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.events.Event;

import java.io.IOException;

import static org.bunnys.handler.utils.ConsoleColors.RED;
import static org.bunnys.handler.utils.ConsoleColors.RESET;

public class ClientReady extends ListenerAdapter implements Event {
    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onReady(ReadyEvent event) {

        String clientNameASCII;
        String clientName = event.getJDA().getSelfUser().getName();

        try {
            clientNameASCII = FigletFont.convertOneLine(clientName);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String[] lines = clientNameASCII.split("\n");

        int maxLength = 0;

        for (String line : lines)
            maxLength = Math.max(maxLength, line.length());

        String underline = "_".repeat(maxLength);

        System.out.println(RED + clientNameASCII + underline + RESET);
        System.out.println(clientName + " is now online!");
    }
}
