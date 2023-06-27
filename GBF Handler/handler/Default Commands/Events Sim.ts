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
      cooldown: 0,
      development: true,
      devOnly: true,
      subcommands: {
        freebie: {
          description: "Simulate FreebieSend event",
          execute: async ({ client, interaction }) => {
            client.emit("FreebieSend", "Epic Games", 2);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Freebie Send`
            });
          }
        },
        join: {
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
        leave: {
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
        channelcreate: {
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
        channeldelete: {
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
        guilddelete: {
          description: "Simulate guildDelete event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildDelete, interaction.guild);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Guild Delete`
            });
          }
        },
        guildjoin: {
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
