const GBFHandler = require("./mainHandler");

class GBF {
    constructor({ client, commandsDir }) {
        if (!client) throw new Error(`You need to pass in "client" in the main file`);
        if (commandsDir) new GBFHandler(commandsDir, client);
    }
}

module.exports = GBF;
