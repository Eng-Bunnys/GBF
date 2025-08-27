package org.bunnys.handler.commands;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.concurrent.*;

/**
 * Loads MessageCommand implementations via ClassGraph and reflection
 * Improvements over the original:
 * - More robust constructor matching (try {JBF, Config}, {JBF}, {Config},
 * no-arg)
 * - Parallel instantiation (CPU-bound reflection) with controlled parallelism
 * - Better logging and error isolation (a failing command won't stop the whole
 * load)
 * - Returns an immutable list
 */
public final class CommandLoader {
    private final String basePackage;
    private final JBF client;

    public CommandLoader(String basePackage, JBF client) {
        this.basePackage = basePackage;
        this.client = Objects.requireNonNull(client, "Client cannot be null");
    }

    /**
     * Load and instantiate message commands found under the configured package
     * This method will attempt several constructor signatures in priority order:
     * - (JBF, Config)
     * - (JBF)
     * - (Config)
     * - ()
     *
     * @return immutable list of instantiated MessageCommand implementations
     */
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
                        // collect class names, instantiation handled later (isolated)
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

        // Use an ExecutorService so we can control parallelism (avoid flooding with too
        // many threads)
        int threads = Math.max(1, Math.min(Runtime.getRuntime().availableProcessors(), 8));
        ExecutorService exec = Executors.newFixedThreadPool(threads, runnable -> {
            Thread t = new Thread(runnable);
            t.setDaemon(true);
            t.setName("cmd-loader-worker");
            return t;
        });

        List<Future<MessageCommand>> futures = new ArrayList<>();

        for (String className : classNames)
            futures.add(exec.submit(() -> instantiateCommandSafely(className)));

        List<MessageCommand> results = new ArrayList<>();
        for (Future<MessageCommand> f : futures) {
            try {
                MessageCommand cmd = f.get(); // let exceptions propagate to catch below
                if (cmd != null)
                    results.add(cmd);
            } catch (ExecutionException ee) {
                Logger.error("[CommandLoader] Command instantiation task threw",
                        ee.getCause() == null ? ee : ee.getCause());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                Logger.error("[CommandLoader] Interrupted while loading commands", ie);
            }
        }

        exec.shutdownNow();

        Logger.debug(() -> "[CommandLoader] Instantiated " + results.size() + " message command(s).");
        return Collections.unmodifiableList(results);
    }

    private MessageCommand instantiateCommandSafely(String className) {
        Class<?> clazz;
        try {
            clazz = Class.forName(className);
        } catch (Throwable t) {
            Logger.error("[CommandLoader] Failed to load class " + className, t);
            return null;
        }

        // Skip abstract/interface/annotation/local classes
        int mods = clazz.getModifiers();
        if (Modifier.isAbstract(mods) || Modifier.isInterface(mods) || clazz.isAnnotation())
            return null;

        if (!MessageCommand.class.isAssignableFrom(clazz)) {
            Logger.debug(() -> "[CommandLoader] Skipping " + className + " as it does not extend MessageCommand");
            return null;
        }

        // Try specific constructor shapes in priority order
        // 1) (JBF, Config)
        // 2) (JBF)
        // 3) (Config)
        // 4) ()
        try {
            // (JBF, Config)
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor(JBF.class, Config.class);
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance(client, client.getConfig());
            } catch (NoSuchMethodException ignored) {
                /* fallthrough */ }

            // (JBF)
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor(JBF.class);
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance(client);
            } catch (NoSuchMethodException ignored) {
                /* fallthrough */ }

            // (Config)
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor(Config.class);
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance(client.getConfig());
            } catch (NoSuchMethodException ignored) {
                /* fallthrough */ }

            // no-arg
            try {
                Constructor<?> ctor = clazz.getDeclaredConstructor();
                ctor.setAccessible(true);
                return (MessageCommand) ctor.newInstance();
            } catch (NoSuchMethodException ignored) {
                /* fallthrough */ }

            // If we reach here, there was no supported constructor
            Logger.error("[CommandLoader] No supported constructor found for " + className);
            return null;
        } catch (Throwable t) {
            // InvocationTargetException / IllegalAccessException / InstantiationException
            // etc.
            Logger.error("[CommandLoader] Failed to instantiate " + className + ": " + t.getMessage(), t);
            return null;
        }
    }
}
