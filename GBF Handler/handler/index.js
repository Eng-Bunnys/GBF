const GBFHandler = require("./main/GBFHandler");

const mongoose = require("mongoose");

class GBF {
  constructor({
    client,
    mongoURI,
    commandsDir,
    testServers = [],
    botOwners = [],
  }) {
    if (!client)
      throw new Error(
        "You must provide a client instance in the handler setup."
      );

    this._testServers = testServers;
    this._botOwners = botOwners;

    if (mongoURI) this.mongoConnect(mongoURI);

    if (commandsDir) new GBFHandler(this, commandsDir, client);
  }

  get testServers() {
    return this._testServers;
  }

  get botOwners() {
    return this._botOwners;
  }
  mongoConnect(mongoURI) {
    mongoose.connect(mongoURI, {
      keepAlive: true,
    });
  }
}

module.exports = GBF;
