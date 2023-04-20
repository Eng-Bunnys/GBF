const { Schema, model } = require("mongoose");

const UserWarnsSchema = new Schema(
  {
    guildId: String,
    userId: String,
    warns: Number,
    warnID: Array,
    warnReason: Array
  },
  {
    collection: "User Warns Docs"
  }
);

module.exports = model("User Warns Docs", UserWarnsSchema);
