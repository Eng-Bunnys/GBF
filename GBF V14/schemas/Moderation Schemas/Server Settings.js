const { Schema, model } = require("mongoose");

const ModerationServerSettings = new Schema(
  {
    guildId: String,
    AdminKick: {
      type: Boolean,
      default: false
    },
    AdminBan: {
      type: Boolean,
      default: false
    }
  },
  {
    collection: "GBF Moderation Docs"
  }
);

module.exports = model("GBF Moderation Docs", ModerationServerSettings);
