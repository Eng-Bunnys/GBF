const { Schema, model } = require("mongoose");

const GBFPrefixSchema = new Schema(
  {
    guildID: String,
    Prefix: {
      type: String,
      default: "!!"
    }
  },
  {
    collection: "GBF Prefixes"
  }
);

module.exports = model("GBF Prefixes", GBFPrefixSchema);
