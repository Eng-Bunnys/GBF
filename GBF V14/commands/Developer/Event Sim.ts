import { PermissionFlagsBits, Events } from "discord.js";

import emojis from "../../GBF/GBFEmojis.json";

import SlashCommand from "../../utils/slashCommands";

module.exports = class SimEvents extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "simulate",
      description: "Simulate events || Dev only",
      category: "Dev",
      botPermission: [PermissionFlagsBits.SendMessages],
      cooldown: 0,
      development: true,
      devOnly: true,
      subcommands: {
        join: {
          description: "Simulate guildMemberAdd event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildMemberAdd, interaction.member);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated User Join`
            });
          }
        },
        leave: {
          description: "Simulate guildMemberRemove event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildMemberRemove, interaction.member);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated User Leave`
            });
          }
        },
        channelcreate: {
          description: "Simulate channelCreate event",

          execute: async ({ client, interaction }) => {
            client.emit(Events.ChannelCreate, interaction.channel);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Create`
            });
          }
        },
        channeldelete: {
          description: "Simulate channelDelete event",

          execute: async ({ client, interaction }) => {
            client.emit(Events.ChannelDelete, interaction.channel);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Delete`
            });
          }
        },
        channelupdate: {
          description: "Simulate channelUpdate event",

          execute: async ({ client, interaction }) => {
            client.emit(Events.ChannelUpdate, interaction.channel);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Update`
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
        }
      }
    });
  }
};
