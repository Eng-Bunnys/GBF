package org.bunnys.handler.utils;
import org.bunnys.handler.Config;

/**
 * Logger utility for JBF Handler
 * Provides methods to log messages with different severity levels
 * Uses ANSI escape codes for colored console output
 * Supports debug mode for internal handler diagnostics
 */
public class Logger {
    private static Config config;

    /** JBF calls this once at startup */
    public static void attachConfig(Config cfg) {
        config = cfg;
    }

    private static boolean debugDisabled() {
        return config == null || !config.debug();
    }

    // --- Always visible (developer logs) ---
    public static void success(String message) {
        System.out.println(ConsoleColors.GREEN + message + ConsoleColors.RESET);
    }

    public static void info(String message) {
        System.out.println(ConsoleColors.CYAN + message + ConsoleColors.RESET);
    }

    public static void warning(String message) {
        System.out.println(ConsoleColors.YELLOW + message + ConsoleColors.RESET);
    }

    public static void error(String message) {
        System.out.println(ConsoleColors.RED + message + ConsoleColors.RESET);
    }

    public static void error(String message, Throwable t) {
        System.out.println(ConsoleColors.RED + message + ConsoleColors.RESET);
        if (t != null) t.printStackTrace(System.out);
    }

    // --- Debug only (JBF internal logs) ---
    public static void debug(String message) {
        if (debugDisabled()) return;
        System.out.println(ConsoleColors.PURPLE + "[DEBUG] " + message + ConsoleColors.RESET);
    }

    public static void debugStackTrace(String message) {
        if (debugDisabled()) return;
        System.out.println(ConsoleColors.PURPLE + "[DEBUG] " + message + ConsoleColors.RESET);
        new Throwable().printStackTrace(System.out);
    }
}
