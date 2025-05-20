package org.bunnys.handler.commands.message.config;

import net.dv8tion.jda.api.Permission;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class MessageCommandConfig {
    private String name;
    private String description;
    private String[] aliases;
    private boolean nsfw;
    private boolean developerOnly;
    private float cooldown;
    private final Set<Permission> userPermissions;
    private final Set<Permission> botPermissions;

    public MessageCommandConfig() {
        this.name = null;
        this.description = null;
        this.aliases = new String[0];
        this.nsfw = false;
        this.developerOnly = false;
        this.cooldown = 0;
        this.userPermissions = new HashSet<>();
        this.botPermissions = new HashSet<>();
    }

    public MessageCommandConfig setName(String name) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Message Command Name cannot be null or blank");

        this.name = name;
        return this;
    }

    public MessageCommandConfig setDescription(String description) {
        this.description = description;
        return this;
    }

    public MessageCommandConfig setAliases(String... aliases) {
        if (aliases == null || aliases.length == 0)
            throw new IllegalArgumentException("Message Command Aliases cannot be null or empty");

        this.aliases = aliases;
        return this;
    }

    public MessageCommandConfig setNSFW(boolean nsfw) {
        this.nsfw = nsfw;
        return this;
    }

    public MessageCommandConfig setDeveloperOnly(boolean developerOnly) {
        this.developerOnly = developerOnly;
        return this;
    }

    public MessageCommandConfig setCooldown(float cooldown) {
        if (cooldown < 0)
            throw new IllegalArgumentException("Message Command Cooldown cannot be negative");

        this.cooldown = cooldown;
        return this;
    }

    public MessageCommandConfig setUserPermissions(Permission... permissions) {
        this.userPermissions.clear();

        if (permissions != null && permissions.length > 0)
            this.userPermissions.addAll(Set.of(permissions));

        return this;
    }

    public MessageCommandConfig setBotPermissions(Permission... permissions) {
        this.botPermissions.clear();

        if (permissions != null && permissions.length > 0)
            this.botPermissions.addAll(Set.of(permissions));

        return this;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String[] getAliases() {
        return aliases;
    }

    public boolean isNSFW() {
        return nsfw;
    }

    public boolean isDeveloperOnly() {
        return developerOnly;
    }

    public float getCooldown() {
        return cooldown;
    }

    public Set<Permission> getUserPermissions() {
        return Collections.unmodifiableSet(userPermissions);
    }

    public Set<Permission> getBotPermissions() {
        return Collections.unmodifiableSet(botPermissions);
    }
}