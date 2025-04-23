package org.bunnys.handler.commands.message;

public class MessageCommandConfig {
    private String name;
    private String description;

    public MessageCommandConfig() {
        this.name = null;
        this.description = null;
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

    public String getName() { return this.name; }
    public String getDescription() { return this.description; }
}
