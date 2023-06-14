import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

import emojis from "../../GBFEmojis.json";

import Origin from "../Game Settings/Origin Settings.json";

export const OriginOneGameButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Origin.GameLink)
      .setLabel(Origin.GameTitle)
      .setEmoji(emojis.ORIGINLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const OriginOneGameEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} EA Freebie ${emojis.frogStare}`)
  .setURL(Origin.GameLink)
  .setDescription(`• Number of Freebies: 1`)
  .addFields({
    name: `${emojis.ORIGINLOGO} [${Origin.GameTitle}]`,
    value: `${Origin.GameLink}`
  })
  .setFooter({
    text: `GBF Freebies`
  });

if (Origin.HasTimestamp) {
  OriginOneGameEmbed.addFields({
    name: `${Origin.GameTitle} is free to claim until:`,
    value: `<t:${Origin.Timestamp}:f>, <t:${Origin.Timestamp}:R>`
  });
}

export const OriginTwoGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Origin.GameLink)
      .setLabel(Origin.GameTitle)
      .setEmoji(emojis.ORIGINLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Origin.GameTwoLink)
      .setLabel(Origin.GameTwoTitle)
      .setEmoji(emojis.ORIGINLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const OriginTwoGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} EA Freebies ${emojis.frogStare}`)
  .setDescription(`• Number of Freebies: 2`)
  .addFields(
    {
      name: `${emojis.ORIGINLOGO} [${Origin.GameTitle}]`,
      value: `${Origin.GameLink}`
    },
    {
      name: `${emojis.ORIGINLOGO} [${Origin.GameTwoTitle}]`,
      value: `${Origin.GameTwoLink}`
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Origin.HasTimestamp) {
  OriginTwoGamesEmbed.addFields({
    name: `${Origin.GameTitle} and ${Origin.GameTwoTitle} are free to claim until:`,
    value: `<t:${Origin.Timestamp}:f>, <t:${Origin.Timestamp}:R>`
  });
}

export const OriginThreeGamesButton: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setURL(Origin.GameLink)
      .setLabel(Origin.GameTitle)
      .setEmoji(emojis.ORIGINLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Origin.GameTwoLink)
      .setLabel(Origin.GameTwoTitle)
      .setEmoji(emojis.ORIGINLOGO)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(Origin.GameThreeLink)
      .setLabel(Origin.GameThreeTitle)
      .setEmoji(emojis.ORIGINLOGO)
      .setStyle(ButtonStyle.Link)
  ]);

export const OriginThreeGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.memeDance} EA Freebies ${emojis.frogStare}`)
  .setDescription(`• Number of Freebies: 3`)
  .addFields(
    {
      name: `${emojis.ORIGINLOGO} [${Origin.GameTitle}]`,
      value: `${Origin.GameLink}`,
      inline: true
    },
    {
      name: `${emojis.ORIGINLOGO} [${Origin.GameTwoTitle}]`,
      value: `${Origin.GameTwoLink}`,
      inline: true
    },
    {
      name: `${emojis.ORIGINLOGO} [${Origin.GameThreeTitle}]`,
      value: `${Origin.GameThreeLink}`,
      inline: true
    }
  )
  .setFooter({
    text: `GBF Freebies`
  });

if (Origin.HasTimestamp) {
  OriginThreeGamesEmbed.addFields({
    name: `${Origin.GameTitle}, ${Origin.GameTwoTitle} and ${Origin.GameThreeTitle} are free to claim until:`,
    value: `<t:${Origin.Timestamp}:f>, <t:${Origin.Timestamp}:R>`
  });
}