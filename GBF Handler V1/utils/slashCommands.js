const GBFSlash = require('../handler/handlerforSlash');

class SlashCommand extends GBFSlash {

    constructor(client, options) {
        super(client, options);
    }
}

module.exports = SlashCommand;