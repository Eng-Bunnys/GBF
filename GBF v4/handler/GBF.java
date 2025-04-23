package org.bunnys.handler;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import org.bunnys.handler.commands.CommandLoader;
import org.bunnys.handler.commands.message.MessageCommand;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.events.Event;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.utils.EnvLoader;
import org.bunnys.handler.utils.Logger;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

public class GBF {
    public Config config;
    private static GBF client;

    // Events
    private boolean loadEvents;
    private final boolean loadHandlerEvents;
    private final AtomicInteger eventCount = new AtomicInteger(0);

    // Commands
    private Map<String, MessageCommand> messageCommands = new HashMap<>();

    long startTime = System.currentTimeMillis();

    public GBF(Config config) {
        this.config = config;
        this.config.token(this.getToken());

        GBF.client = this;

        if (this.config.EventFolder() != null
                && !this.config.EventFolder().isBlank()
                && !this.config.IgnoreEvents())
            this.loadEvents = true;

        this.loadHandlerEvents = !this.config.IgnoreEventsFromHandler();

        if (this.config.AutoLogin())
            try {
                this.login();
            } catch (InterruptedException err) {
                Logger.error("Error logging in\n" + err.getMessage());
            }
    }

    private void RegisterCommands() {
        // To-do: Add checks for command folder etc.
        messageCommands = CommandLoader.loadCommands(this.config.CommandsFolder());

        Logger.success("Loaded " + messageCommands.size() + " commands");
    }

    private void RegisterEvents(JDA builder) {
        try {
            if (this.loadHandlerEvents) {
                String handlerEventFolder = "org.bunnys.handler.events.defaults";
                List<Event> handlerEvents = EventLoader.loadEvents(handlerEventFolder);

                handlerEvents.forEach(event -> {
                    event.register(builder);

                    if (this.config.LogActions())
                        this.eventCount.incrementAndGet();
                });
            }

            if (this.loadEvents) {
                List<Event> events = EventLoader.loadEvents(this.config.EventFolder());

                events.forEach(event -> {
                    event.register(builder);

                    if (this.config.LogActions())
                        this.eventCount.incrementAndGet();
                });
            }
        } catch (Exception e) {
            Logger.error("Error loading events\n" + e.getMessage());
        }
    }

    public void login() throws InterruptedException {
        try {
            List<GatewayIntent> intents = this.config.intents();

            JDA builder = JDABuilder.create(this.config.token(), intents)
                    .setMemberCachePolicy(MemberCachePolicy.DEFAULT)
                    .setChunkingFilter(ChunkingFilter.NONE)
                    .build();

            CompletableFuture<Void> eventRegistration = CompletableFuture.runAsync(() -> {
                RegisterEvents(builder);
                RegisterCommands();
            });

            CompletableFuture<Void> botReady = CompletableFuture.runAsync(() -> {
                try {
                    builder.awaitReady();

                    if (this.config.LogActions()) {
                        if (this.loadEvents)
                            Logger.success("Loaded " + this.eventCount.get() + " event"
                                    + (this.eventCount.get() > 1 ? "s" : ""));

                        long endTime = System.currentTimeMillis();

                        Logger.success("GBF Handler v6 is ready! Took " + (endTime - this.startTime) + "ms to load");
                    }

                } catch (InterruptedException e) {
                    Logger.error("Error waiting for bot to be ready\n" + e.getMessage());
                }
            });

            CompletableFuture.allOf(eventRegistration, botReady).join();

        } catch (Exception err) {
            Logger.error("Error logging in\n" + err.getMessage());
        }
    }

    public static GBF getClient() {
        return GBF.client;
    }

    private String getToken() {
        return EnvLoader.get("TOKEN");
    }

    // Command Getters
    public MessageCommand getCommand(String name) {
        return messageCommands.get(name);
    }
}
