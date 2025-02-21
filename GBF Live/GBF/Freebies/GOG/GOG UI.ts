import { ColorResolvable, EmbedBuilder } from "discord.js";
import colors from "../../GBFColor.json";
import emojis from "../../GBFEmojis.json";

import GOG from "../Game Settings/GOG Settings.json";

export const GOGOneGameInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.GOGLOGO} Freebie Sender`)
  .setColor(colors.GOG as ColorResolvable)
  .addFields({
    name: `Game One:`,
    value: `• Title: ${GOG.GameTitle}\n• Link: ${GOG.GameLink}\n• Free Until: <t:${GOG.Timestamp}:f>\n• Send Timestamp: ${GOG.HasTimestamp}`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || GOG`
  });

export const GOGsTwoGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.GOGLOGO} Freebie Sender`)
  .setColor(colors.GOG as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${GOG.GameTitle}\n• Link: ${GOG.GameLink}\n• Free Until: <t:${GOG.Timestamp}:f>\n• Send Timestamp: ${GOG.HasTimestamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${GOG.GameTwoTitle}\n• Link: ${GOG.GameTwoLink}\n• Free Until: <t:${GOG.Timestamp}:f>\n• Send Timestamp: ${GOG.HasTimestamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || GOG`
  });

export const GOGThreeGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.GOGLOGO} Freebie Sender`)
  .setColor(colors.GOG as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${GOG.GameTitle}\n• Link: ${GOG.GameLink}\n• Free Until: <t:${GOG.Timestamp}:f>\n• Send Timestamp: ${GOG.HasTimestamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${GOG.GameTwoTitle}\n• Link: ${GOG.GameTwoLink}\n• Free Until: <t:${GOG.Timestamp}:f>\n• Send Timestamp: ${GOG.HasTimestamp}`
    },
    {
      name: `Game Three:`,
      value: `• Title: ${GOG.GameThreeTitle}\n• Link: ${GOG.GameThreeLink}\n• Free Until: <t:${GOG.Timestamp}:f>\n• Send Timestamp: ${GOG.HasTimestamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || GOG`
  });