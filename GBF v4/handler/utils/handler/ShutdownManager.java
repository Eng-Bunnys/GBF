package org.bunnys.handler.utils.handler;

import net.dv8tion.jda.api.JDA;
import org.bunnys.handler.GBF;
import org.bunnys.handler.utils.Logger;

import java.util.concurrent.TimeUnit;

public class ShutdownManager {
    public static void Shutdown() {
        JDA jda = BotInitializer.getJDA();
        if (jda != null) {
            jda.shutdown();
            try {
                if (!jda.awaitShutdown(2, TimeUnit.SECONDS)) {
                    jda.shutdownNow();
                }
            } catch (InterruptedException e) {
                Logger.error("Interrupted during JDA shutdown: " + e.getMessage());
                Thread.currentThread().interrupt();
            }
        }
        GBF.SHARED_POOL.shutdown();
        try {
            if (!GBF.SHARED_POOL.awaitTermination(2, TimeUnit.SECONDS))
                GBF.SHARED_POOL.shutdownNow();
        } catch (InterruptedException e) {
            Logger.error("Interrupted during thread pool shutdown: " + e.getMessage());
            Thread.currentThread().interrupt();
        }
    }
}