package org.bunnys.handler.lifecycle;

import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.utils.handler.logging.Logger;

public class ShardManagerLifecycle {
    public static void reconnect(BunnyNexus bunnyNexus, String newToken) {
        Logger.warning("Attempting to reconnect with a new token...");
        shutdown(bunnyNexus);
        bunnyNexus.updateToken(newToken);
        bunnyNexus.setShardManager(ShardManagerInitializer.initShardManager(bunnyNexus.getConfig()));
        EventLifecycle.loadAndRegisterEvents(bunnyNexus.getConfig(), bunnyNexus, bunnyNexus.getShardManager());
    }

    public static void shutdown(BunnyNexus bunnyNexus) {
        if (bunnyNexus.getShardManager() != null) {
            try {
                bunnyNexus.getShardManager().shutdown();
                Logger.info("ShardManager shutdown complete.");
            } catch (Exception e) {
                Logger.error("Error during ShardManager shutdown: " + e.getMessage(), e);
            } finally {
                bunnyNexus.setShardManager(null);
            }
        } else {
            Logger.debug(() -> "Shutdown requested but ShardManager was null.");
        }
    }
}
