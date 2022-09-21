class GBFCmd {

    constructor (client, {
        name = "",
        aliases = [],
        category = "",
        description = "",
        usage = "",
        examples = "",
        cooldown = 0,
        userPermission = [],
        botPermission = [],
        devOnly = false,
        Partner = false,
        args = [],
    }) {
        this.client = client;
        this.name = name;
        this.aliases = aliases;
        this.category = category;
        this.description = description;
        this.usage = usage;
        this.examples = examples;
        this.cooldown = cooldown;
        this.userPermission = userPermission;
        this.botPermission = botPermission;
        this.devOnly = devOnly;
        this.Partner = Partner
        this.args = args;
    }

   
}

module.exports = GBFCmd;
