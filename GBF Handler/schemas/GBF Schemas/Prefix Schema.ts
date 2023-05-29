import { Schema, model, Document } from "mongoose";

interface IPrefix {
  guildID: string;
  Prefix: string;
}

const GBFPrefixSchema = new Schema<IPrefix>(
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

const GBFPrefixModel = model<IPrefix>("GBF Prefixes", GBFPrefixSchema);

export { IPrefix, GBFPrefixModel };
