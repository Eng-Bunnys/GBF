package org.bunnys.handler.utils;

public class Logger {
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

    public static void debug(String message) {
        System.out.println(ConsoleColors.PURPLE + "[DEBUG] " + message + ConsoleColors.RESET);
    }
}
