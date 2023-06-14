import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

import emojis from "../../GBFEmojis.json";

import Steam from "../Game Settings/Steam Settings.json";

export const SteamOneGameButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Steam.GameLink)
      .setLabel(Steam.GameTitle)
      .setEmoji(emojis.STEAMLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const SteamOneGameEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ParrotDance} Steam Freebie ${emojis.PepeHappy}`)
  .setURL(Steam.GameLink)
  .setDescription(`• Number of Freebies: 1`)
  .setThumbnail(Steam.GamePicture)
  .addFields(
    {
      name: `${emojis.STEAMLOGO} [${Steam.GameTitle}]`,
      value: `${Steam.GameLink}`
    },
    {
      name: `Game Rating:`,
      value: `${Steam.GameRating}/5 ⭐`
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Steam.HasTimestamp) {
  SteamOneGameEmbed.addFields({
    name: `${Steam.GameTitle} is free to claim until:`,
    value: `<t:${Steam.Timestamp}:f>, <t:${Steam.Timestamp}:R>`
  });
}

export const SteamTwoGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Steam.GameLink)
      .setLabel(Steam.GameTitle)
      .setEmoji(emojis.STEAMLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Steam.GameTwoLink)
      .setLabel(Steam.GameTwoTitle)
      .setEmoji(emojis.STEAMLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const SteamTwoGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ParrotDance} Steam Freebies ${emojis.PepeHappy}`)
  .setDescription(`• Number of Freebies: 2`)
  .addFields(
    {
      name: `${emojis.STEAMLOGO} [${Steam.GameTitle}]`,
      value: `${Steam.GameLink}`
    },
    {
      name: `${emojis.STEAMLOGO} [${Steam.GameTwoTitle}]`,
      value: `${Steam.GameTwoLink}`
    },
    {
      name: `Game Ratings:`,
      value: `• ${Steam.GameTitle}: ${Steam.GameRating}/5 ⭐\n• ${Steam.GameTwoTitle}: ${Steam.GameTwoRating}/5 ⭐`
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Steam.HasTimestamp) {
  SteamTwoGamesEmbed.addFields({
    name: `${Steam.GameTitle} and ${Steam.GameTwoTitle} are free to claim until:`,
    value: `<t:${Steam.Timestamp}:f>, <t:${Steam.Timestamp}:R>`
  });
}

export const SteamThreeGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Steam.GameLink)
      .setLabel(Steam.GameTitle)
      .setEmoji(emojis.STEAMLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Steam.GameTwoLink)
      .setLabel(Steam.GameTwoTitle)
      .setEmoji(emojis.STEAMLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Steam.GameThreeLink)
      .setLabel(Steam.GameThreeTitle)
      .setEmoji(emojis.STEAMLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const SteamThreeGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ParrotDance} Steam Freebies ${emojis.PepeHappy}`)
  .setDescription(`• Number of Freebies: 3`)
  .addFields(
    {
      name: `${emojis.STEAMLOGO} [${Steam.GameTitle}]`,
      value: `${Steam.GameLink}`,
      inline: true
    },
    {
      name: `${emojis.STEAMLOGO} [${Steam.GameTwoTitle}]`,
      value: `${Steam.GameTwoLink}`,
      inline: true
    },
    {
      name: `${emojis.STEAMLOGO} [${Steam.GameThreeTitle}]`,
      value: `${Steam.GameThreeLink}`,
      inline: true
    },
    {
      name: `Game Ratings:`,
      value: `• ${Steam.GameTitle}: ${Steam.GameRating}/5 ⭐\n• ${Steam.GameTwoTitle}: ${Steam.GameTwoRating}/5 ⭐\n• ${Steam.GameThreeTitle}: ${Steam.GameThreeRating}/5 ⭐`
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Steam.HasTimestamp) {
  SteamTwoGamesEmbed.addFields({
    name: `${Steam.GameTitle}, ${Steam.GameTwoTitle} and ${Steam.GameThreeTitle} are free to claim until:`,
    value: `<t:${Steam.Timestamp}:f>, <t:${Steam.Timestamp}:R>`
  });
}
