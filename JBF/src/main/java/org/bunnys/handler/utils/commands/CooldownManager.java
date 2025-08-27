package org.bunnys.handler.utils.commands;

import java.util.concurrent.ConcurrentHashMap;

public class CooldownManager {
    private static final ConcurrentHashMap<String, Long> cooldowns = new ConcurrentHashMap<>();

    private CooldownManager() {}

    public static boolean isOnCooldown(String commandName, String userID, long cooldownMS) {
        if (cooldownMS <= 0) return false;

        String key = commandName + ":" + userID;
        long now = System.currentTimeMillis();
        Long expiresAt = cooldowns.get(key);

        if (expiresAt != null && expiresAt > now)
            return true; // Still on cooldown

        cooldowns.put(key, now + cooldownMS);
        return false;
     }

    public static long getRemainingCooldown(String commandName, String userID) {
        String key = commandName + ":" + userID;
        Long expiresAt = cooldowns.get(key);

        if (expiresAt == null)
            return 0;

        long remaining = expiresAt - System.currentTimeMillis();
        return Math.max(0, remaining);
    }
}
