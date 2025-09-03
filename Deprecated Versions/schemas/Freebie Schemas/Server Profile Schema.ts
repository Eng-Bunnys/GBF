import { Schema, model } from "mongoose";

interface IFreebieProfile {
  Enabled: boolean;
  FreebieId: string;
  guildId: string;
  DefaultChannel: string;
  DefaultMention: boolean;
  DefaultRole: string;
  EmbedColor: string;
  UseDefault: boolean;
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
    DefaultChannel: String,
    DefaultMention: Boolean,
    DefaultRole: String,
    EmbedColor: String,
    UseDefault: {
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
    SteamEnabled: falseBoolean,
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
