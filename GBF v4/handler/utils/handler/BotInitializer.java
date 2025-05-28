package org.bunnys.handler.utils.handler;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.utils.ChunkingFilter;
import net.dv8tion.jda.api.utils.MemberCachePolicy;
import org.bunnys.handler.GBF;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.EnvLoader;
import org.bunnys.handler.utils.Logger;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class BotInitializer {
    private static final int DEFAULT_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 500;
    private static volatile JDA jda;
    private final Config config;

    public BotInitializer(Config config) {
        this.config = config;
        String token = config.token() != null && !config.token().isBlank()
                ? config.token()
                : EnvLoader.get("TOKEN");

        if (token == null || token.isBlank())
            throw new IllegalStateException("Bot token is not specified in config or environment.");

        this.config.token(token);
    }

    public CompletableFuture<Void> login() {
        long jdaStart = System.currentTimeMillis();

        List<GatewayIntent> intents = this.config.intents().isEmpty()
                ? Arrays.asList(GatewayIntent.GUILD_MESSAGES, GatewayIntent.DIRECT_MESSAGES)
                : this.config.intents();

        return attemptLogin(intents, 0, INITIAL_BACKOFF_MS)
                .thenRun(() -> {
                    if (this.config.LogActions())
                        Logger.info("JDA initialization took " + (System.currentTimeMillis() - jdaStart) + "ms");
                });
    }

    private CompletableFuture<Object> attemptLogin(List<GatewayIntent> intents, int attempt, long backoff) {
        if (attempt >= this.config.getRetries(DEFAULT_RETRIES)) {
            return CompletableFuture.failedFuture(
                    new RuntimeException("Failed to initialize JDA after " + this.config.getRetries(DEFAULT_RETRIES) + " attempts"));
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                jda = JDABuilder.create(this.config.token(), intents)
                        .setMemberCachePolicy(MemberCachePolicy.DEFAULT)
                        .setChunkingFilter(ChunkingFilter.NONE)
                        .build();
                return null;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, GBF.SHARED_POOL).thenComposeAsync(result -> {
            if (result == null)
                return CompletableFuture.completedFuture(null);

            // This should not be reached due to exception handling in supplyAsync
            return CompletableFuture.completedFuture(null);
        }, GBF.SHARED_POOL).exceptionallyAsync(throwable -> {
            Logger.warning("JDA initialization failed, retrying (" + (attempt + 1) + "/" +
                    config.getRetries(DEFAULT_RETRIES) + "): " + throwable.getMessage());
            return CompletableFuture.runAsync(() -> {}, GBF.SHARED_POOL)
                    .orTimeout(backoff, TimeUnit.MILLISECONDS)
                    .thenComposeAsync(__ -> attemptLogin(intents, attempt + 1, backoff * 2), GBF.SHARED_POOL);
        }, GBF.SHARED_POOL);
    }

    public void awaitReady(Runnable onReady) {
        CompletableFuture.runAsync(() -> {
            try {
                jda.awaitReady();
                if (config.LogActions())
                    onReady.run();
            } catch (InterruptedException e) {
                Logger.error("Error waiting for bot to be ready: " + e.getMessage());
                Thread.currentThread().interrupt();
            }
        }, GBF.SHARED_POOL);
    }

    public static JDA getJDA() {
        return jda;
    }
}