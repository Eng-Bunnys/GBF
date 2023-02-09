const { Schema, model } = require('mongoose');

const schemaBlacklist = new Schema({
  userId: String,
  Blacklist: Boolean,
  reason: String,
});

module.exports = model('GBF-Blacklist', schemaBlacklist);
