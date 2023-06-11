import {
  EmbedBuilder,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import colors from "../GBFColor.json";
import emojis from "../GBFEmojis.json";

export const ControlPanel = new EmbedBuilder()
  .setTitle("GBF Freebies Control Panel")
  .setColor(colors.DEFAULT as ColorResolvable)
  .setDescription(`Please use the buttons below to start`)
  .addFields({
    name: "Buttons:",
    value: `**Guide:**\nEmoji 🡪 Button to click\nNumber 🡪 Number of games supported\n• Epic Games: ${emojis.EPIC} (3)\n• Steam: ${emojis.STEAMLOGO} (3)\n• GOG: ${emojis.GOGLOGO} (3)\n• Prime Gaming: ${emojis.PRIME} (3)\n• Origin: ${emojis.ORIGINLOGO} (3)\n• Ubisoft: ${emojis.UBISOFTLOGO} (3)`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Protected Message`
  });

export enum FreebieCodes {
  "Epic Games" = "EGS",
  "Steam" = "STEAM",
  "GOG" = "GOG",
  "Prime Gaming" = "PRIME",
  "EA" = "EA",
  "Ubisoft" = "UBI",
  "Exit" = "Exit",
  "Go Back" = "GoBackPanel"
}

export const ConfirmButtons: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("ConfirmFreebieSend")
      .setEmoji(emojis.VERIFY)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("DenyFreebieSend")
      .setEmoji(emojis.ERROR)
      .setStyle(ButtonStyle.Danger)
  ]);

export const ControlPanelFirstRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents(
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

export const ControlPanelSecondRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents(
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

export const ControlPanelFirstRowDisabled: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`EGS_Disabled`)
      .setEmoji(`${emojis.EPIC}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`STEAM_Disabled`)
      .setEmoji(`${emojis.STEAMLOGO}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`GOG_Disabled`)
      .setEmoji(`${emojis.GOGLOGO}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`PRIME_Disabled`)
      .setEmoji(`${emojis.PRIME}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );

export const ControlPanelSecondRowDisabled: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`EA_Disabled`)
      .setEmoji(`${emojis.ORIGINLOGO}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`UBI_Disabled`)
      .setEmoji(`${emojis.UBISOFTLOGO}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("empty")
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`\u200b`)
      .setDisabled(true),
    new ButtonBuilder()
      .setLabel(`Exit`)
      .setCustomId(`Exit`)
      .setDisabled(true)
      .setStyle(ButtonStyle.Danger)
  );

export const PanelEpicGamesEmbed = new EmbedBuilder()
  .setTitle(`${emojis.EPIC} Epic Games Freebie Menu`)
  .setColor(colors.EGS as ColorResolvable)
  .setDescription(
    `Please use the buttons to choose which service you want\nThis service supports up to 3 games`
  )
  .addFields({
    name: "Buttons",
    value: `One Game:1️⃣\nTwo Games:\u200b2️⃣\nThree Games:3️⃣`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Epic Games`
  });

export const PanelSteamEmbed = new EmbedBuilder()
  .setTitle(`${emojis.STEAMLOGO} Steam Freebie Menu`)
  .setColor(colors.STEAM as ColorResolvable)
  .setDescription(
    `Please use the buttons to choose which service you want\nThis service supports up to 3 games`
  )
  .addFields({
    name: "Buttons",
    value: `One Game:1️⃣\nTwo Games:\u200b2️⃣\nThree Games:3️⃣`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Steam`
  });

export const PanelGOGEmbed = new EmbedBuilder()
  .setTitle(`${emojis.GOGLOGO} GOG Freebie Menu`)
  .setColor(colors.GOG as ColorResolvable)
  .setDescription(
    `Please use the buttons to choose which service you want\nThis service supports up to 3 games`
  )
  .addFields({
    name: "Buttons",
    value: `One Game:1️⃣\nTwo Games:2️⃣\nThree Games:3️⃣`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || GOG`
  });

export const PanelPrimeEmbed = new EmbedBuilder()
  .setTitle(`${emojis.PRIME} Prime Freebie Menu`)
  .setColor(colors.PRIME as ColorResolvable)
  .setDescription(
    `Please use the buttons to choose which service you want\nThis service supports up to 3 games`
  )
  .addFields({
    name: "Buttons",
    value: `One Game:1️⃣\nTwo Games:\u200b2️⃣\nThree Games:3️⃣`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Prime Gaming`
  });

export const PanelOriginEmbed = new EmbedBuilder()
  .setTitle(`${emojis.ORIGINLOGO} Origin Freebie Menu`)
  .setColor(colors.ORIGIN as ColorResolvable)
  .setDescription(
    `Please use the buttons to choose which service you want\nThis service supports up to 3 games`
  )
  .addFields({
    name: "Buttons",
    value: `One Game:1️⃣\nTwo Games:\u200b2️⃣\nThree Games:3️⃣`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Origin`
  });

export const PanelUbisoftEmbed = new EmbedBuilder()
  .setTitle(`${emojis.UBISOFTLOGO} Ubisoft Freebie Menu`)
  .setColor(colors.UBISOFT as ColorResolvable)
  .setDescription(
    `Please use the buttons to choose which service you want\nThis service supports up to 3 games`
  )
  .addFields({
    name: "Buttons",
    value: `One Game:1️⃣\nTwo Games:\u200b2️⃣\nThree Games:3️⃣`
  })
  .setTimestamp()
  .setFooter({
    text: `GBF Freebies || Ubisoft`
  });

export enum LauncherGamesNumbers {
  "Ubisoft One" = "UbiOne",
  "Ubisoft Two" = "UbiTwo",
  "Ubisoft Three" = "UbiThree",
  "Origin One" = "OriginOne",
  "Origin Two" = "OriginTwo",
  "Origin Three" = "OriginThree",
  "Prime Gaming One" = "PrimeOne",
  "Prime Gaming Two" = "PrimeTwo",
  "Prime Gaming Three" = "PrimeThree",
  "GOG One" = "GOGOne",
  "GOG Two" = "GOGTwo",
  "GOG Three" = "GOGThree",
  "Steam One" = "SteamOne",
  "Steam Two" = "SteamTwo",
  "Steam Three" = "SteamThree",
  "Epic Games One" = "EGSOne",
  "Epic Games Two" = "EGSTwo",
  "Epic Games Three" = "EGSThree"
}

export const PanelUbisoftRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("UbiOne")
      .setLabel("1️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("UbiTwo")
      .setLabel("2️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("UbiThree")
      .setLabel("3️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GoBackPanel")
      .setLabel(`Go Back`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
  ]);

export const PanelOriginRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("OriginOne")
      .setLabel("1️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("OriginTwo")
      .setLabel("2️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("OriginThree")
      .setLabel("3️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GoBackPanel")
      .setLabel(`Go Back`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
  ]);

export const PanelPrimeRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("PrimeOne")
      .setLabel("1️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("PrimeTwo")
      .setLabel("2️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("PrimeThree")
      .setLabel("3️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GoBackPanel")
      .setLabel(`Go Back`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
  ]);

export const PanelGOGRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("GOGOne")
      .setLabel("1️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GOGTwo")
      .setLabel("2️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GOGThree")
      .setLabel("3️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GoBackPanel")
      .setLabel(`Go Back`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
  ]);

export const PanelSteamRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("SteamOne")
      .setLabel("1️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("SteamTwo")
      .setLabel("2️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("SteamThree")
      .setLabel("3️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GoBackPanel")
      .setLabel(`Go Back`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
  ]);

export const PanelEpicGamesRow: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("EGSOne")
      .setLabel("1️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("EGSTwo")
      .setLabel("2️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("EGSThree")
      .setLabel("3️⃣")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("GoBackPanel")
      .setLabel(`Go Back`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
  ]);
