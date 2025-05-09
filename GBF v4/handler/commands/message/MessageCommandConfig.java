package org.bunnys.handler.commands.message;

public class MessageCommandConfig {
    /**
     * The name of the command
     */
    private String name;
    /**
     * The description of the command
     * 
     * @default No description
     * @optional
     */
    private String description;
    /**
     * The aliases of the command
     * 
     * @default []
     * @optional
     */
    private String[] aliases;

    /**
     * Whether the command can be used in NSFW channels or not
     * 
     * @default false
     * @optional
     */
    private boolean NSFW;

    /***
     * Whether the command can be used by anyone but a developer
     * 
     * @default false
     * @optional
     */
    private boolean developerOnly;

    public MessageCommandConfig() {
        this.name = null;
        this.description = null;
        this.aliases = new String[0];

        this.NSFW = false;
        this.developerOnly = false;
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

    public MessageCommandConfig setNSFW(boolean NSFW) {
        this.NSFW = NSFW;
        return this;
    }

    public MessageCommandConfig setDeveloperOnly(boolean developerOnly) {
        this.developerOnly = developerOnly;
        return this;
    }

    // Getters

    public String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public String[] getAliases() {
        return this.aliases;
    }

    public boolean isNSFW() {
        return this.NSFW;
    }

    public boolean isDeveloperOnly() {
        return this.developerOnly;
    }
}
