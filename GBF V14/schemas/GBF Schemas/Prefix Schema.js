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
    collection: "GBF Prefixs"
  }
);

module.exports = model("GBF Prefixs", GBFPrefixSchema);
