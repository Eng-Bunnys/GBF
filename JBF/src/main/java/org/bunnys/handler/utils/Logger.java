package org.bunnys.handler.utils;

import org.bunnys.handler.Config;

/**
 * Logger utility for JBF Handler
 * Provides methods to log messages with different severity levels
 * Uses ANSI escape codes for colored console output
 * Supports debug mode based on configuration
 * Do not use this class directly, it is designed to be used by JBF Handler and its components
 */
public class Logger {

    private static Config config;

    /** JBF calls this once at startup */
    public static void attachConfig(Config cfg) {
        config = cfg;
    }

    private static boolean isEnabled() {
        // If no config yet, assume logs are allowed (startup safety)
        return config != null && !config.debug();
    }

    public static void success(String message) {
        if (isEnabled()) return;
        System.out.println(ConsoleColors.GREEN + message + ConsoleColors.RESET);
    }

    public static void info(String message) {
        if (isEnabled()) return;
        System.out.println(ConsoleColors.CYAN + message + ConsoleColors.RESET);
    }

    public static void warning(String message) {
        if (isEnabled()) return;
        System.out.println(ConsoleColors.YELLOW + message + ConsoleColors.RESET);
    }

    public static void error(String message) {
        if (isEnabled()) return;
        System.out.println(ConsoleColors.RED + message + ConsoleColors.RESET);
    }

    public static void debug(String message) {
        if (isEnabled()) return;
        System.out.println(ConsoleColors.PURPLE + "[DEBUG] " + message + ConsoleColors.RESET);
    }

    public static void debugStackTrace(String message) {
        if (isEnabled()) return;
        System.out.println(ConsoleColors.PURPLE + "[DEBUG] " + message + ConsoleColors.RESET);
        new Throwable().printStackTrace(System.out);
    }
}
