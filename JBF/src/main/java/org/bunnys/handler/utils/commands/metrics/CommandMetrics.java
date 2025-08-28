package org.bunnys.handler.utils.commands.metrics;

import org.bunnys.handler.utils.handler.logging.Logger;
import org.bunnys.handler.utils.commands.handlers.CommandVerification;

import java.util.concurrent.ConcurrentHashMap;

public class CommandMetrics {
    private final ConcurrentHashMap<String, Long> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> successes = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> failures = new ConcurrentHashMap<>();

    public void recordCommandAttempt(String cmd, String userId) {
        attempts.merge(key(cmd, userId), 1L, Long::sum);
    }

    public void recordCommandSuccess(String cmd, String userId) {
        successes.merge(key(cmd, userId), 1L, Long::sum);
    }

    public void recordCommandFailure(String cmd, String userId,
                                     CommandVerification.ValidationFailureType type) {
        failures.merge(key(cmd, userId) + ":" + type, 1L, Long::sum);
    }

    public void recordCommandError(String cmd, String userId, Throwable ex) {
        failures.merge(key(cmd, userId) + ":ERROR", 1L, Long::sum);
    }

    public void recordExecutionTime(String cmd, long ms) {
        if (ms > 5000)
            Logger.warning("[Perf] Command '" + cmd + "' took " + ms + "ms");
    }

    private String key(String cmd, String userId) {
        return cmd + ":" + userId;
    }
}
