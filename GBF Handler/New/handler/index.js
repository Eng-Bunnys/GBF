const GBFHandler = require("./src/Command Handler/mainHandler");
const mongoose = require("mongoose");

class GBF {
  constructor({ client, mongoURI, commandsDir, testServers = [] }) {
    if (!client) throw new Error(`"client" is missing from the setup`);
    this._testServers = testServers;
    if (commandsDir) new GBFHandler(this, commandsDir, client);

    if (mongoURI) this.mongoConnect(mongoURI);
  }

  get testServers() {
    return this._testServers;
  }
  
  mongoConnect(mongoURI) {
    mongoose.connect(mongoURI, {
      keepAlive: true,
    });
  }
}

module.exports = GBF;
