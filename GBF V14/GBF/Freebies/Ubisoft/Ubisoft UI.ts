import { ColorResolvable, EmbedBuilder } from "discord.js";
import colors from "../../GBFColor.json";
import emojis from "../../GBFEmojis.json";

import Ubisoft from "../Game Settings/Ubisoft Settings.json";

export const UbisoftOneGameInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.UBISOFTLOGO} Freebie Sender`)
  .setColor(colors.UBISOFT as ColorResolvable)
  .addFields({
    name: `Game One:`,
    value: `• Title: ${Ubisoft.GameTitle}\n• Link: ${Ubisoft.GameLink}\n• Free Until: <t:${Ubisoft.Timestamp}:f>\n• Send Timestamp: ${Ubisoft.HasTimestamp}`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Ubisoft`
  });

export const UbisoftTwoGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.UBISOFTLOGO} Freebie Sender`)
  .setColor(colors.UBISOFT as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${Ubisoft.GameTitle}\n• Link: ${Ubisoft.GameLink}\n• Free Until: <t:${Ubisoft.Timestamp}:f>\n• Send Timestamp: ${Ubisoft.HasTimestamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${Ubisoft.GameTwoTitle}\n• Link: ${Ubisoft.GameTwoLink}\n• Free Until: <t:${Ubisoft.Timestamp}:f>\n• Send Timestamp: ${Ubisoft.HasTimestamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Ubisoft`
  });

export const UbisoftThreeGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.UBISOFTLOGO} Freebie Sender`)
  .setColor(colors.UBISOFT as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${Ubisoft.GameTitle}\n• Link: ${Ubisoft.GameLink}\n• Free Until: <t:${Ubisoft.Timestamp}:f>\n• Send Timestamp: ${Ubisoft.HasTimestamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${Ubisoft.GameTwoTitle}\n• Link: ${Ubisoft.GameTwoLink}\n• Free Until: <t:${Ubisoft.Timestamp}:f>\n• Send Timestamp: ${Ubisoft.HasTimestamp}`
    },
    {
      name: `Game Three:`,
      value: `• Title: ${Ubisoft.GameThreeTitle}\n• Link: ${Ubisoft.GameThreeLink}\n• Free Until: <t:${Ubisoft.Timestamp}:f>\n• Send Timestamp: ${Ubisoft.HasTimestamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Ubisoft`
  });
