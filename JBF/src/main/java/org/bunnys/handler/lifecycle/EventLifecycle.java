package org.bunnys.handler.lifecycle;

import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.events.EventRegistry;
import org.bunnys.handler.events.DefaultEvents;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.handler.logging.Logger;

public class EventLifecycle {
    public static void loadAndRegisterEvents(Config config, JBF jbf, ShardManager shardManager) {
        EventRegistry registry = new EventRegistry(jbf);

        if (config.debug())
            Logger.info("[JBF] Loading events from config package: " + config.eventsPackage());

        if (config.eventsPackage() != null && !config.eventsPackage().isBlank()) {
            EventLoader loader = new EventLoader(config.eventsPackage(), jbf);
            loader.loadEvents().forEach(registry::add);
        }

        if (config.debug())
            Logger.info("[JBF] Loading default events...");

        for (var def : DefaultEvents.values()) {
            if (config.disabledDefaults().contains(DefaultEvents.ALL)) {
                Logger.debug(() -> "[JBF] All default events are disabled.");
                break;
            }
            if (def == DefaultEvents.ALL)
                continue;

            if (!config.disabledDefaults().contains(def)) {
                try {
                    Event event = def.create(jbf);
                    registry.add(event);
                    Logger.debug(() -> "[JBF] Registered default event: " + def.name());
                } catch (Exception e) {
                    Logger.error("[JBF] Failed to initialize default event: " + def.name(), e);
                }
            } else {
                Logger.debug(() -> "[JBF] Skipped disabled default event: " + def.name());
            }
        }

        if (registry.isEmpty()) {
            Logger.warning("[JBF] No events were loaded; skipping registration.");
            return;
        }

        registry.registerAll(shardManager);
        Logger.success("[JBF] Loaded " + registry.size() + " event" +
                (registry.size() == 1 ? "" : "s") + ".");
    }
}
