import {
  EmbedBuilder,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

export const ControlPanel = new EmbedBuilder()
  .setTitle("GBF Freebies Control Panel")
  .setColor(colors.DEFAULT as ColorResolvable)
  .setDescription(`Please use the buttons below to start`)
  .addFields({
    name: "Buttons:",
    value: `**Guide:**\nEmoji 🡪 Button to click\nNumber 🡪 Number of games supported\n• Epic Games: ${emojis.EPIC} (3)\n• Steam: ${emojis.STEAMLOGO} (3)\n• GOG: ${emojis.GOGLOGO} (3)\n• Prime Gaming: ${emojis.PRIME} (3)\n• Origin: ${emojis.ORIGINLOGO} (3)\n• Ubisoft: ${emojis.UBISOFTLOGO} (3)`
  })
  .setTimestamp();

export const ControlPanelFirstRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(`EGS`)
    .setEmoji(`${emojis.EPIC}`)
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId(`STEAM`)
    .setEmoji(`${emojis.STEAMLOGO}`)
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId(`GOG`)
    .setEmoji(`${emojis.GOGLOGO}`)
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId(`PRIME`)
    .setEmoji(`${emojis.PRIME}`)
    .setStyle(ButtonStyle.Secondary)
);

export const ControlPanelSecondRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(`EA`)
    .setEmoji(`${emojis.ORIGINLOGO}`)
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId(`UBI`)
    .setEmoji(`${emojis.UBISOFTLOGO}`)
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("empty")
    .setStyle(ButtonStyle.Secondary)
    .setLabel(`\u200b`),
  new ButtonBuilder()
    .setLabel(`Exit`)
    .setCustomId(`Exit`)
    .setStyle(ButtonStyle.Danger)
);
