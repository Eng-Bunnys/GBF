import { ColorResolvable, EmbedBuilder } from "discord.js";
import colors from "../../GBFColor.json";
import emojis from "../../GBFEmojis.json";

import Origin from "../Game Settings/Origin Settings.json";

export const OriginOneGameInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ORIGINLOGO} Freebie Sender`)
  .setColor(colors.ORIGIN as ColorResolvable)
  .addFields({
    name: `Game One:`,
    value: `• Title: ${Origin.GameTitle}\n• Link: ${Origin.GameLink}\n• Free Until: <t:${Origin.Timestamp}:f>\n• Send Timestamp: ${Origin.HasTimestamp}`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || EA`
  });

export const OriginTwoGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ORIGINLOGO} Freebie Sender`)
  .setColor(colors.ORIGIN as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${Origin.GameTitle}\n• Link: ${Origin.GameLink}\n• Free Until: <t:${Origin.Timestamp}:f>\n• Send Timestamp: ${Origin.HasTimestamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${Origin.GameTwoTitle}\n• Link: ${Origin.GameTwoLink}\n• Free Until: <t:${Origin.Timestamp}:f>\n• Send Timestamp: ${Origin.HasTimestamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || EA`
  });

export const OriginThreeGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ORIGINLOGO} Freebie Sender`)
  .setColor(colors.ORIGIN as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${Origin.GameTitle}\n• Link: ${Origin.GameLink}\n• Free Until: <t:${Origin.Timestamp}:f>\n• Send Timestamp: ${Origin.HasTimestamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${Origin.GameTwoTitle}\n• Link: ${Origin.GameTwoLink}\n• Free Until: <t:${Origin.Timestamp}:f>\n• Send Timestamp: ${Origin.HasTimestamp}`
    },
    {
      name: `Game Three:`,
      value: `• Title: ${Origin.GameThreeTitle}\n• Link: ${Origin.GameThreeLink}\n• Free Until: <t:${Origin.Timestamp}:f>\n• Send Timestamp: ${Origin.HasTimestamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || EA`
  });