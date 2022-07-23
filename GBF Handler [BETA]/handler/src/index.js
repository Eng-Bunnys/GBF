const GBFHandler = require("./mainHandler");
const mongoose = require("mongoose");

class GBF {
  constructor({ client, mongoURI, commandsDir }) {
    if (!client) throw new Error(`A client is required.`);
    if (commandsDir) new GBFHandler(commandsDir, client);

    if (mongoURI) this.mongoConnect(mongoURI);
  }

  mongoConnect(mongoURI) {
    mongoose.connect(mongoURI, {
      keepAlive: true,
    });
  }
}

module.exports = GBF;
