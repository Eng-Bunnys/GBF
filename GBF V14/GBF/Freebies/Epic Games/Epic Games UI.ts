import { ColorResolvable, EmbedBuilder } from "discord.js";
import colors from "../../GBFColor.json";
import emojis from "../../GBFEmojis.json";

import EGS from "../Game Settings/Epic Games Settings.json";

export const EpicGamesOneGameInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.EPIC} Freebie Sender`)
  .setColor(colors.EGS as ColorResolvable)
  .addFields({
    name: `Game One:`,
    value: `• Title: ${EGS.GameTitle}\n• Link: ${EGS.GameLink}\n• Price on Steam: ${EGS.GamePrice}\n• Free Until: <t:${EGS.Timestamp}:f>\n• Send Timestamp: ${EGS.HasTimeStamp}`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Epic Games`
  });

export const EpicGamesTwoGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.EPIC} Freebie Sender`)
  .setColor(colors.EGS as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${EGS.GameTitle}\n• Link: ${EGS.GameLink}\n• Price on Steam: ${EGS.GamePrice}\n• Free Until: <t:${EGS.Timestamp}:f>\n• Send Timestamp: ${EGS.HasTimeStamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${EGS.GameTwoTitle}\n• Link: ${EGS.GameTwoLink}\n• Price on Steam: ${EGS.GameTwoPrice}\n• Free Until: <t:${EGS.Timestamp}:f>\n• Send Timestamp: ${EGS.HasTimeStamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Epic Games`
  });

export const EpicGamesThreeGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.EPIC} Freebie Sender`)
  .setColor(colors.EGS as ColorResolvable)
  .addFields(
    {
      name: `Game One:`,
      value: `• Title: ${EGS.GameTitle}\n• Link: ${EGS.GameLink}\n• Price on Steam: ${EGS.GamePrice}\n• Free Until: <t:${EGS.Timestamp}:f>\n• Send Timestamp: ${EGS.HasTimeStamp}`
    },
    {
      name: `Game Two:`,
      value: `• Title: ${EGS.GameTwoTitle}\n• Link: ${EGS.GameTwoLink}\n• Price on Steam: ${EGS.GameTwoPrice}\n• Free Until: <t:${EGS.Timestamp}:f>\n• Send Timestamp: ${EGS.HasTimeStamp}`
    },
    {
      name: `Game Three:`,
      value: `• Title: ${EGS.GameThreeTitle}\n• Link: ${EGS.GameThreeLink}\n• Price on Steam: ${EGS.GameThreePrice}\n• Free Until: <t:${EGS.Timestamp}:f>\n• Send Timestamp: ${EGS.HasTimeStamp}`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Epic Games`
  });
