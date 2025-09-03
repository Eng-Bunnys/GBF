import {
  PermissionFlagsBits,
  Events,
  GuildMember,
  NonThreadGuildBasedChannel
} from "discord.js";

import emojis from "../../GBF/GBFEmojis.json";
import GBFClient from "../clienthandler";

import SlashCommand from "../../utils/slashCommands";

export default class SimEvents extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "simulate",
      description: "Simulate events || Dev only",
      category: "Developer",
      botPermission: [PermissionFlagsBits.SendMessages],
      development: true,
      devOnly: true,
      subcommands: {
        user_join: {
          description: "Simulate guildMemberAdd event",
          execute: async ({ client, interaction }) => {
            client.emit(
              Events.GuildMemberAdd,
              interaction.member as GuildMember
            );
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated User Join`
            });
          }
        },
        user_leave: {
          description: "Simulate guildMemberRemove event",
          execute: async ({ client, interaction }) => {
            client.emit(
              Events.GuildMemberRemove,
              interaction.member as GuildMember
            );
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated User Leave`
            });
          }
        },
        channel_create: {
          description: "Simulate channelCreate event",
          execute: async ({ client, interaction }) => {
            client.emit(
              Events.ChannelCreate,
              interaction.channel as NonThreadGuildBasedChannel
            );
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Create`
            });
          }
        },
        channel_delete: {
          description: "Simulate channelDelete event",
          execute: async ({ client, interaction }) => {
            client.emit(
              Events.ChannelDelete,
              interaction.channel as NonThreadGuildBasedChannel
            );
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Delete`
            });
          }
        },
        guild_delete: {
          description: "Simulate guildDelete event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildDelete, interaction.guild);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Guild Delete`
            });
          }
        },
        guild_join: {
          description: "Simulate guildCreate event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildCreate, interaction.guild);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Guild Create`
            });
          }
        }
      }
    });
  }
}