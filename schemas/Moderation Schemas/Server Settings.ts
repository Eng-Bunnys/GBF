import { Schema, model } from "mongoose";

interface IServerSettings {
  guildId: string;
  LogsChannel: string;
  AdminMute: boolean;
  AdminKick: boolean;
  AdminBan: boolean;
  BanDM: boolean;
}

const boolFalse = { type: Boolean, default: false };

const ModerationServerSettings = new Schema<IServerSettings>(
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

const GBFServerModerationSettingsModel = model<IServerSettings>(
  "GBF Moderation Docs",
  ModerationServerSettings
);

export { IServerSettings, GBFServerModerationSettingsModel };