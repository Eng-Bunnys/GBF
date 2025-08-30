package org.bunnys.handler.commands;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.Config;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.spi.SlashCommand;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.concurrent.*;

/**
 * Loads MessageCommand and SlashCommand implementations via ClassGraph and reflection
 * Improvements over the original:
 * - More robust constructor matching (try {BunnyNexus, Config}, {BunnyNexus}, {Config}, no-arg)
 * - Parallel instantiation (CPU-bound reflection) with controlled parallelism
 * - Better logging and error isolation (a failing command won't stop the whole load)
 * - Returns immutable lists
 */
public final class CommandLoader {
    private final String basePackage;
    private final BunnyNexus client;

    public CommandLoader(String basePackage, BunnyNexus client) {
        this.basePackage = basePackage;
        this.client = Objects.requireNonNull(client, "Client cannot be null");
    }

    /* =====================================================
       MESSAGE COMMAND LOADING
       ===================================================== */
    public List<MessageCommand> loadMessageCommands() {
        if (basePackage == null || basePackage.isBlank())
            return List.of();

        List<String> classNames = new ArrayList<>();
        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(basePackage)
                .scan()) {
            scanResult.getSubclasses(MessageCommand.class.getName())
                    .forEach(classInfo -> {
                        try {
                            classNames.add(classInfo.getName());
                        } catch (Exception e) {
                            Logger.error("[CommandLoader] Failed to read class name: " + classInfo, e);
                        }
                    });
        } catch (Exception e) {
            Logger.error("[CommandLoader] ClassGraph scan failed for package: " + basePackage, e);
            return List.of();
        }

        if (classNames.isEmpty()) {
            Logger.debug(() -> "[CommandLoader] No MessageCommand subclasses found in " + basePackage);
            return List.of();
        }

        int threads = Math.max(1, Math.min(Runtime.getRuntime().availableProcessors(), 8));
        ExecutorService exec = Executors.newFixedThreadPool(threads, r -> {
            Thread t = new Thread(r);
            t.setDaemon(true);
            t.setName("msg-loader-worker");
            return t;
        });

        List<Future<MessageCommand>> futures = new ArrayList<>();
        for (String className : classNames)
            futures.add(exec.submit(() -> instantiateMessageSafely(className)));

        List<MessageCommand> results = new ArrayList<>();
        for (Future<MessageCommand> f : futures) {
            try {
                MessageCommand cmd = f.get();
                if (cmd != null) results.add(cmd);
            } catch (ExecutionException ee) {
                Logger.error("[CommandLoader] MessageCommand instantiation task threw",
                        ee.getCause() == null ? ee : ee.getCause());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                Logger.error("[CommandLoader] Interrupted while loading message commands", ie);
            }
        }

        exec.shutdownNow();
        Logger.debug(() -> "[CommandLoader] Instantiated " + results.size() + " message command(s).");
        return Collections.unmodifiableList(results);
    }

    private MessageCommand instantiateMessageSafely(String className) {
        Class<?> clazz;
        try {
            clazz = Class.forName(className);
        } catch (Throwable t) {
            Logger.error("[CommandLoader] Failed to load class " + className, t);
            return null;
        }

        int mods = clazz.getModifiers();
        if (Modifier.isAbstract(mods) || Modifier.isInterface(mods) || clazz.isAnnotation())
            return null;

        if (!MessageCommand.class.isAssignableFrom(clazz)) {
            Logger.debug(() -> "[CommandLoader] Skipping " + className + " (not a MessageCommand)");
            return null;
        }

        try {
            // (BunnyNexus, Config)
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor(BunnyNexus.class, Config.class);
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance(client, client.getConfig());
            } catch (NoSuchMethodException ignored) {}

            // (BunnyNexus)
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor(BunnyNexus.class);
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance(client);
            } catch (NoSuchMethodException ignored) {}

            // (Config)
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor(Config.class);
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance(client.getConfig());
            } catch (NoSuchMethodException ignored) {}

            // ()
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor();
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance();
            } catch (NoSuchMethodException ignored) {}

            Logger.error("[CommandLoader] No supported constructor found for " + className);
            return null;
        } catch (Throwable t) {
            Logger.error("[CommandLoader] Failed to instantiate " + className + ": " + t.getMessage(), t);
            return null;
        }
    }

    /* =====================================================
       SLASH COMMAND LOADING
       ===================================================== */
    public List<SlashCommand> loadSlashCommands() {
        if (basePackage == null || basePackage.isBlank())
            return List.of();

        List<String> classNames = new ArrayList<>();
        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(basePackage)
                .scan()) {
            scanResult.getSubclasses(SlashCommand.class.getName())
                    .forEach(classInfo -> {
                        try {
                            classNames.add(classInfo.getName());
                        } catch (Exception e) {
                            Logger.error("[CommandLoader] Failed to read class name: " + classInfo, e);
                        }
                    });
        } catch (Exception e) {
            Logger.error("[CommandLoader] ClassGraph scan failed for package: " + basePackage, e);
            return List.of();
        }

        if (classNames.isEmpty()) {
            Logger.debug(() -> "[CommandLoader] No SlashCommand subclasses found in " + basePackage);
            return List.of();
        }

        int threads = Math.max(1, Math.min(Runtime.getRuntime().availableProcessors(), 8));
        ExecutorService exec = Executors.newFixedThreadPool(threads, r -> {
            Thread t = new Thread(r);
            t.setDaemon(true);
            t.setName("slash-loader-worker");
            return t;
        });

        List<Future<SlashCommand>> futures = new ArrayList<>();
        for (String className : classNames)
            futures.add(exec.submit(() -> instantiateSlashSafely(className)));

        List<SlashCommand> results = new ArrayList<>();
        for (Future<SlashCommand> f : futures) {
            try {
                SlashCommand cmd = f.get();
                if (cmd != null) results.add(cmd);
            } catch (ExecutionException ee) {
                Logger.error("[CommandLoader] SlashCommand instantiation task threw",
                        ee.getCause() == null ? ee : ee.getCause());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                Logger.error("[CommandLoader] Interrupted while loading slash commands", ie);
            }
        }

        exec.shutdownNow();
        Logger.debug(() -> "[CommandLoader] Instantiated " + results.size() + " slash command(s).");
        return Collections.unmodifiableList(results);
    }

    private SlashCommand instantiateSlashSafely(String className) {
        Class<?> clazz;
        try {
            clazz = Class.forName(className);
        } catch (Throwable t) {
            Logger.error("[CommandLoader] Failed to load class " + className, t);
            return null;
        }

        int mods = clazz.getModifiers();
        if (Modifier.isAbstract(mods) || Modifier.isInterface(mods) || clazz.isAnnotation())
            return null;

        if (!SlashCommand.class.isAssignableFrom(clazz)) {
            Logger.debug(() -> "[CommandLoader] Skipping " + className + " (not a SlashCommand)");
            return null;
        }

        try {
            // For now we only support () constructor for slash commands
            Constructor<?> ctor = clazz.getDeclaredConstructor();
            ctor.setAccessible(true);
            return (SlashCommand) ctor.newInstance();
        } catch (Throwable t) {
            Logger.error("[CommandLoader] Failed to instantiate slash command " + className, t);
            return null;
        }
    }
}
