const { Schema, model } = require("mongoose");

const BanSchema = new Schema(
  {
    userId: String,
    guildId: String,
    Cases: {
      type: Array,
      default: []
    },
    Reasons: {
      type: Array,
      default: []
    },
    TotalCases: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "GBF Ban Docs"
  }
);

module.exports = model("GBF Ban Docs", BanSchema);
