const { Schema, model } = require("mongoose");

const KickSchema = new Schema(
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
    collection: "GBF Kick Docs"
  }
);

module.exports = model("GBF Kick Docs", KickSchema);
