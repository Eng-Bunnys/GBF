import { Schema, model, Document } from "mongoose";

interface IFreebieProfile extends Document {
  Enabled: boolean;
  FreebieId: string;
  guildId: string;
  Channel: string;
  Ping: boolean;
  rolePing: string;
  embedColor: string;
  activeCategory: number;
  useDefault: boolean;
  AllEnabled: boolean | true;
  EGSEnabled: boolean | false;
  EGSRole: string | null;
  EGSMention: boolean | false;
  SteamEnabled: boolean | false;
  SteamRole: string | null;
  SteamMention: boolean | false;
  OtherEnabled: boolean | false;
  OtherRole: string | null;
  OtherMention: boolean | false;
  EGSChannel: string | null;
  SteamChannel: string | null;
  OtherChannel: string | null;
}

const nullString = {
  type: String,
  default: null
};

const falseBoolean = {
  type: Boolean,
  default: false
};

const FreebieProfileSchema = new Schema<IFreebieProfile>(
  {
    Enabled: Boolean,
    FreebieId: String,
    guildId: String,
    Channel: String,
    Ping: Boolean,
    rolePing: String,
    embedColor: String,
    useDefault: {
      type: Boolean,
      default: true
    },
    AllEnabled: {
      type: Boolean,
      default: true
    },
    EGSEnabled: falseBoolean,
    EGSRole: nullString,
    EGSMention: falseBoolean,
    SteamEnabled: nullString,
    SteamRole: nullString,
    SteamMention: falseBoolean,
    OtherEnabled: falseBoolean,
    OtherRole: nullString,
    OtherMention: falseBoolean,
    EGSChannel: nullString,
    SteamChannel: nullString,
    OtherChannel: nullString
  },
  {
    collection: "Freebie Documents"
  }
);

const FreebieProfileModel = model<IFreebieProfile>(
  "Freebie Documents",
  FreebieProfileSchema
);

export { IFreebieProfile, FreebieProfileModel };
