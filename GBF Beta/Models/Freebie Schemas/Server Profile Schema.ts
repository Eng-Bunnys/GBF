import { Schema, model } from "mongoose";

const NullString = {
  type: String,
  default: null,
};

const FalseBoolean = {
  type: Boolean,
  default: false,
};

/**
 * Represents the configuration for handling freebies in a server.
 */
interface IFreebie {
  /**
   * Whether Freebies is enabled in the server.
   */
  Enabled: boolean;

  /**
   * The ID of the guild.
   */
  GuildID: string;

  /**
   * The default channel to send the freebies to.
   */
  DefaultChannel: string;

  /**
   * The default role to mention when a freebie is sent.
   */
  DefaultRole: string;

  /**
   * The color of the freebies embed.
   */
  EmbedColor: string;

  /**
   * Whether to send only certain categories or not.
   * If false, freebies from all categories will be sent.
   */
  UseCategories: boolean;

  /**
   * Whether Epic Games Freebies is enabled or not.
   * If true, Epic Games freebies will be handled.
   */
  EpicEnabled: boolean;

  /**
   * The role to mention when an Epic Games freebie is sent.
   * Can be null if no specific role is set.
   */
  EpicRole: string | null;

  /**
   * Whether to mention the Epic Games role when a freebie is sent.
   */
  EpicMention: boolean;

  /**
   * The channel to send Epic Games freebies to.
   * Can be null if no specific channel is set.
   */
  EpicChannel: string | null;

  /**
   * Whether Steam Freebies is enabled or not.
   * If true, Steam freebies will be handled.
   */
  SteamEnabled: boolean;

  /**
   * The role to mention when a Steam freebie is sent.
   * Can be null if no specific role is set.
   */
  SteamRole: string | null;

  /**
   * Whether to mention the Steam role when a freebie is sent.
   */
  SteamMention: boolean;

  /**
   * The channel to send Steam freebies to.
   * Can be null if no specific channel is set.
   */
  SteamChannel: string | null;

  /**
   * Whether Other Freebies is enabled or not.
   * If true, freebies from other platforms will be handled.
   */
  OtherEnabled: boolean;

  /**
   * The role to mention when a freebie from other platforms is sent.
   * Can be null if no specific role is set.
   */
  OtherRole: string | null;

  /**
   * Whether to mention the role for other freebies when a freebie is sent.
   */
  OtherMention: boolean;

  /**
   * The channel to send freebies from other platforms to.
   * Can be null if no specific channel is set.
   */
  OtherChannel: string | null;

  /**
   * Whether Mobile Freebies is enabled or not.
   * If true, freebies for mobile platforms will be handled.
   */
  MobileEnabled: boolean;

  /**
   * The role to mention when a freebie for mobile platforms is sent.
   * Can be null if no specific role is set.
   */
  MobileRole: string | null;

  /**
   * Whether to mention the role for mobile freebies when a freebie is sent.
   */
  MobileMention: boolean;

  /**
   * The channel to send freebies for mobile platforms to.
   * Can be null if no specific channel is set.
   */
  MobileChannel: string | null;
}

const FreebieProfileSchema = new Schema<IFreebie>({});

const FreebieProfile = model<IFreebie>(
  "Freebie Documents",
  FreebieProfileSchema
);

export { FreebieProfile };
