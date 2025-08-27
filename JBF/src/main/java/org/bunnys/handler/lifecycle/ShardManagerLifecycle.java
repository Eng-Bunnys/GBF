package org.bunnys.handler.lifecycle;

import org.bunnys.handler.JBF;
import org.bunnys.handler.utils.Logger;

public class ShardManagerLifecycle {
    public static void reconnect(JBF jbf, String newToken) {
        Logger.warning("Attempting to reconnect with a new token...");
        shutdown(jbf);
        jbf.updateToken(newToken);
        jbf.setShardManager(ShardManagerInitializer.initShardManager(jbf.getConfig()));
        EventLifecycle.loadAndRegisterEvents(jbf.getConfig(), jbf, jbf.getShardManager());
    }

    public static void shutdown(JBF jbf) {
        if (jbf.getShardManager() != null) {
            try {
                jbf.getShardManager().shutdown();
                Logger.info("ShardManager shutdown complete.");
            } catch (Exception e) {
                Logger.error("Error during ShardManager shutdown: " + e.getMessage(), e);
            } finally {
                jbf.setShardManager(null);
            }
        } else {
            Logger.debug(() -> "Shutdown requested but ShardManager was null.");
        }
    }
}
