import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

import emojis from "../../GBFEmojis.json";

import GOG from "../Game Settings/GOG Settings.json";

export const GOGOneGameButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(GOG.GameLink)
      .setLabel(GOG.GameTitle)
      .setEmoji(emojis.GOGLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const GOGOneGameEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} GOG Freebie ${emojis.frogStare}`)
  .setURL(GOG.GameLink)
  .setDescription(`• Number of Freebies: 1`)
  .addFields({
    name: `${emojis.GOGLOGO} [${GOG.GameTitle}]`,
    value: `${GOG.GameLink}`
  })
  .setFooter({
    text: `GBF Freebies`
  });

if (GOG.HasTimestamp) {
  GOGOneGameEmbed.addFields({
    name: `${GOG.GameTitle} is free to claim until:`,
    value: `<t:${GOG.Timestamp}:f>, <t:${GOG.Timestamp}:R>`
  });
}

export const GOGTwoGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(GOG.GameLink)
      .setLabel(GOG.GameTitle)
      .setEmoji(emojis.GOGLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(GOG.GameTwoLink)
      .setLabel(GOG.GameTwoTitle)
      .setEmoji(emojis.GOGLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const GOGTwoGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} GOG Freebies ${emojis.frogStare}`)
  .setDescription(`• Number of Freebies: 2`)
  .addFields(
    {
      name: `${emojis.STEAMLOGO} [${GOG.GameTitle}]`,
      value: `${GOG.GameLink}`
    },
    {
      name: `${emojis.STEAMLOGO} [${GOG.GameTwoTitle}]`,
      value: `${GOG.GameTwoLink}`
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (GOG.HasTimestamp) {
  GOGTwoGamesEmbed.addFields({
    name: `${GOG.GameTitle} and ${GOG.GameTwoTitle} are free to claim until:`,
    value: `<t:${GOG.Timestamp}:f>, <t:${GOG.Timestamp}:R>`
  });
}

export const GOGThreeGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(GOG.GameLink)
      .setLabel(GOG.GameTitle)
      .setEmoji(emojis.GOGLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(GOG.GameTwoLink)
      .setLabel(GOG.GameTwoTitle)
      .setEmoji(emojis.GOGLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(GOG.GameThreeLink)
      .setLabel(GOG.GameThreeTitle)
      .setEmoji(emojis.GOGLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const GOGThreeGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} GOG Freebies ${emojis.frogStare}`)
  .setDescription(`• Number of Freebies: 3`)
  .addFields(
    {
      name: `${emojis.STEAMLOGO} [${GOG.GameTitle}]`,
      value: `${GOG.GameLink}`,
      inline: true
    },
    {
      name: `${emojis.STEAMLOGO} [${GOG.GameTwoTitle}]`,
      value: `${GOG.GameTwoLink}`,
      inline: true
    },
    {
      name: `${emojis.STEAMLOGO} [${GOG.GameThreeTitle}]`,
      value: `${GOG.GameThreeLink}`,
      inline: true
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (GOG.HasTimestamp) {
  GOGThreeGamesEmbed.addFields({
    name: `${GOG.GameTitle}, ${GOG.GameTwoTitle} and ${GOG.GameThreeTitle} are free to claim until:`,
    value: `<t:${GOG.Timestamp}:f>, <t:${GOG.Timestamp}:R>`
  });
}
