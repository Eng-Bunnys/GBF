const CommandHandler = require('./main/LegacyHandler');

const mongoose = require('mongoose');

class GBF {
  constructor({ client, mongoURI, commandsDir, testServers = [] }) {
    if (!client) throw new Error('You must provide a client instance in the handler setup.')

    this._testServers = testServers;

    if (mongoURI) {
      this.mongoConnect(mongoURI)
    }

    if (commandsDir) {
      new CommandHandler(this, commandsDir, client);
    }
  }

  get testServers() {
    return this._testServers
  }

  mongoConnect(mongoURI) {
    mongoose.connect(mongoURI, {
      keepAlive: true,
    })
  }
}

module.exports = GBF;
