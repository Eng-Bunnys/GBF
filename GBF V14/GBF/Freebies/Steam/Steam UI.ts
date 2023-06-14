import { ColorResolvable, EmbedBuilder } from "discord.js";
import colors from "../../GBFColor.json";
import emojis from "../../GBFEmojis.json";

import Steam from "../Game Settings/Steam Settings.json";

export const SteamOneGameInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.STEAMLOGO} Freebie Sender`)
  .setColor(colors.STEAM as ColorResolvable)
  .addFields({
    name: "Game One",
    value: `• Title: ${Steam.GameTitle}\n• Link: ${Steam.GameLink}\n• Has Timestamp: ${Steam.HasTimestamp}\n• Timestamp: <t:${Steam.Timestamp}:f>`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Steam`
  });

export const SteamTwoGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.STEAMLOGO} Freebie Sender`)
  .setColor(colors.STEAM as ColorResolvable)
  .addFields(
    {
      name: "Game One",
      value: `• Title: ${Steam.GameTitle}\n• Link: ${Steam.GameLink}\n• Has Timestamp: ${Steam.HasTimestamp}\n• Timestamp: <t:${Steam.Timestamp}:f>`
    },
    {
      name: "Game Two",
      value: `• Title: ${Steam.GameTwoTitle}\n• Link: ${Steam.GameTwoLink}\n• Has Timestamp: ${Steam.HasTimestamp}\n• Timestamp: <t:${Steam.Timestamp}:f>`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Steam`
  });

export const SteamThreeGamesInfoEmbed = new EmbedBuilder()
  .setTitle(`${emojis.STEAMLOGO} Freebie Sender`)
  .setColor(colors.STEAM as ColorResolvable)
  .addFields(
    {
      name: "Game One",
      value: `• Title: ${Steam.GameTitle}\n• Link: ${Steam.GameLink}\n• Has Timestamp: ${Steam.HasTimestamp}\n• Timestamp: <t:${Steam.Timestamp}:f>`
    },
    {
      name: "Game Two",
      value: `• Title: ${Steam.GameTwoTitle}\n• Link: ${Steam.GameTwoLink}\n• Has Timestamp: ${Steam.HasTimestamp}\n• Timestamp: <t:${Steam.Timestamp}:f>`
    },
    {
      name: "Game Three",
      value: `• Title: ${Steam.GameThreeTitle}\n• Link: ${Steam.GameThreeLink}\n• Has Timestamp: ${Steam.HasTimestamp}\n• Timestamp: <t:${Steam.Timestamp}:f>`
    }
  )
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Steam`
  });
