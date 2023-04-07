const GBFCmd = require("../handler/commandhandler");

class Command extends GBFCmd {
    
    constructor(client, options) {
        super(client, options);
    }
}

module.exports = Command;
