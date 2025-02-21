import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

import emojis from "../../GBFEmojis.json";

import Ubisoft from "../Game Settings/Ubisoft Settings.json";

export const UbisoftOneGameButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Ubisoft.GameLink)
      .setLabel(Ubisoft.GameTitle)
      .setEmoji(emojis.UBISOFTLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const UbisoftOneGameEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} Ubisoft Freebie ${emojis.frogStare}`)
  .setURL(Ubisoft.GameLink)
  .setDescription(`• Number of Freebies: 1`)
  .addFields({
    name: `${emojis.UBISOFTLOGO} [${Ubisoft.GameTitle}]`,
    value: `${Ubisoft.GameLink}`
  })
  .setFooter({
    text: `GBF Freebies`
  });

if (Ubisoft.HasTimestamp) {
  UbisoftOneGameEmbed.addFields({
    name: `${Ubisoft.GameTitle} is free to claim until:`,
    value: `<t:${Ubisoft.Timestamp}:f>, <t:${Ubisoft.Timestamp}:R>`
  });
}

export const UbisoftTwoGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Ubisoft.GameLink)
      .setLabel(Ubisoft.GameTitle)
      .setEmoji(emojis.UBISOFTLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Ubisoft.GameTwoLink)
      .setLabel(Ubisoft.GameTwoTitle)
      .setEmoji(emojis.UBISOFTLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const UbisoftTwoGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} Ubisoft Freebies ${emojis.frogStare}`)
  .setDescription(`• Number of Freebies: 2`)
  .addFields(
    {
      name: `${emojis.UBISOFTLOGO} [${Ubisoft.GameTitle}]`,
      value: `${Ubisoft.GameLink}`
    },
    {
      name: `${emojis.UBISOFTLOGO} [${Ubisoft.GameTwoTitle}]`,
      value: `${Ubisoft.GameTwoLink}`
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Ubisoft.HasTimestamp) {
  UbisoftTwoGamesEmbed.addFields({
    name: `${Ubisoft.GameTitle} and ${Ubisoft.GameTwoTitle} are free to claim until:`,
    value: `<t:${Ubisoft.Timestamp}:f>, <t:${Ubisoft.Timestamp}:R>`
  });
}

export const UbisoftThreeGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Ubisoft.GameLink)
      .setLabel(Ubisoft.GameTitle)
      .setEmoji(emojis.UBISOFTLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Ubisoft.GameTwoLink)
      .setLabel(Ubisoft.GameTwoTitle)
      .setEmoji(emojis.UBISOFTLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Ubisoft.GameThreeLink)
      .setLabel(Ubisoft.GameThreeTitle)
      .setEmoji(emojis.UBISOFTLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const UbisoftThreeGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} Ubisoft Freebies ${emojis.frogStare}`)
  .setDescription(`• Number of Freebies: 3`)
  .addFields(
    {
      name: `${emojis.UBISOFTLOGO} [${Ubisoft.GameTitle}]`,
      value: `${Ubisoft.GameLink}`,
      inline: true
    },
    {
      name: `${emojis.UBISOFTLOGO} [${Ubisoft.GameTwoTitle}]`,
      value: `${Ubisoft.GameTwoLink}`,
      inline: true
    },
    {
      name: `${emojis.UBISOFTLOGO} [${Ubisoft.GameThreeTitle}]`,
      value: `${Ubisoft.GameThreeLink}`,
      inline: true
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Ubisoft.HasTimestamp) {
  UbisoftThreeGamesEmbed.addFields({
    name: `${Ubisoft.GameTitle}, ${Ubisoft.GameTwoTitle} and ${Ubisoft.GameThreeTitle} are free to claim until:`,
    value: `<t:${Ubisoft.Timestamp}:f>, <t:${Ubisoft.Timestamp}:R>`
  });
}
