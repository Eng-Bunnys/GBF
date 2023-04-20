const { Schema, model } = require("mongoose");

const boolFalse = { type: Boolean, default: false };

const ModerationServerSettings = new Schema(
  {
    guildId: String,
    LogsChannel: String,
    AdminMute: boolFalse,
    AdminKick: boolFalse,
    AdminBan: boolFalse,
    BanDM: boolFalse
  },
  {
    collection: "GBF Moderation Docs"
  }
);

module.exports = model("GBF Moderation Docs", ModerationServerSettings);
