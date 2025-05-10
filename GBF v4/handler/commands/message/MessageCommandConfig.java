package org.bunnys.handler.commands.message;

import net.dv8tion.jda.api.Permission;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MessageCommandConfig {
    private String name;
    private String description;
    private String[] aliases;
    private boolean nsfw;
    private boolean developerOnly;
    private float cooldown;
    private final List<Permission> requiredUserPermissions;
    private final List<Permission> requiredBotPermissions;

    public MessageCommandConfig() {
        this.name = null;
        this.description = null;
        this.aliases = new String[0];
        this.nsfw = false;
        this.developerOnly = false;
        this.cooldown = 0;
        this.requiredUserPermissions = new ArrayList<>();
        this.requiredBotPermissions = new ArrayList<>();
    }

    public MessageCommandConfig setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Message Command Name cannot be null or blank");
        }
        this.name = name;
        return this;
    }

    public MessageCommandConfig setDescription(String description) {
        this.description = description;
        return this;
    }

    public MessageCommandConfig setAliases(String... aliases) {
        if (aliases == null || aliases.length == 0) {
            throw new IllegalArgumentException("Message Command Aliases cannot be null or empty");
        }
        this.aliases = aliases;
        return this;
    }

    public MessageCommandConfig setNsfw(boolean nsfw) {
        this.nsfw = nsfw;
        return this;
    }

    public MessageCommandConfig setDeveloperOnly(boolean developerOnly) {
        this.developerOnly = developerOnly;
        return this;
    }

    public MessageCommandConfig setCooldown(float cooldown) {
        if (cooldown < 0) {
            throw new IllegalArgumentException("Message Command Cooldown cannot be negative");
        }
        this.cooldown = cooldown;
        return this;
    }

    public MessageCommandConfig setRequiredUserPermissions(Permission... permissions) {
        this.requiredUserPermissions.clear();
        if (permissions != null && permissions.length > 0) {
            this.requiredUserPermissions.addAll(Arrays.asList(permissions));
        }
        return this;
    }

    public MessageCommandConfig setRequiredBotPermissions(Permission... permissions) {
        this.requiredBotPermissions.clear();
        if (permissions != null && permissions.length > 0) {
            this.requiredBotPermissions.addAll(Arrays.asList(permissions));
        }
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

    public List<Permission> getRequiredUserPermissions() {
        return requiredUserPermissions;
    }

    public List<Permission> getRequiredBotPermissions() {
        return requiredBotPermissions;
    }
}