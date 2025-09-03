import { Schema, model } from "mongoose";

interface IWarnSchema {
  guildId: string;
  userId: string;
  warns: number;
  warnID: string[];
  warnReason: string[];
}

const UserWarnsSchema = new Schema<IWarnSchema>(
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

const UserWarnModel = model<IWarnSchema>("User Warns Docs", UserWarnsSchema);

export { IWarnSchema, UserWarnModel };
