package org.bunnys.handler.lifecycle;

import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.Config;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.events.EventLoader;
import org.bunnys.handler.events.EventRegistry;
import org.bunnys.handler.events.DefaultEvents;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.handler.logging.Logger;

public class EventLifecycle {
    public static void loadAndRegisterEvents(Config config, BunnyNexus bunnyNexus, ShardManager shardManager) {
        EventRegistry registry = new EventRegistry(bunnyNexus);

        if (config.debug())
            Logger.info("[BunnyNexus] Loading events from config package: " + config.eventsPackage());

        if (config.eventsPackage() != null && !config.eventsPackage().isBlank()) {
            EventLoader loader = new EventLoader(config.eventsPackage(), bunnyNexus);
            loader.loadEvents().forEach(registry::add);
        }

        if (config.debug())
            Logger.info("[BunnyNexus] Loading default events...");

        for (var def : DefaultEvents.values()) {
            if (config.disabledDefaults().contains(DefaultEvents.ALL)) {
                Logger.debug(() -> "[BunnyNexus] All default events are disabled.");
                break;
            }
            if (def == DefaultEvents.ALL)
                continue;

            if (!config.disabledDefaults().contains(def)) {
                try {
                    Event event = def.create(bunnyNexus);
                    registry.add(event);
                    Logger.debug(() -> "[BunnyNexus] Registered default event: " + def.name());
                } catch (Exception e) {
                    Logger.error("[BunnyNexus] Failed to initialize default event: " + def.name(), e);
                }
            } else {
                Logger.debug(() -> "[BunnyNexus] Skipped disabled default event: " + def.name());
            }
        }

        if (registry.isEmpty()) {
            Logger.warning("[BunnyNexus] No events were loaded; skipping registration.");
            return;
        }

        registry.registerAll(shardManager);
        Logger.success("[BunnyNexus] Loaded " + registry.size() + " event" +
                (registry.size() == 1 ? "" : "s") + ".");
    }
}
