import {
  ActionRowBuilder,
  ColorResolvable,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import colors from "../GBFColor.json";
import emojis from "../GBFEmojis.json";

export const BaseShop = new EmbedBuilder()
  .setTitle(`SueLuz Shop`)
  .setColor(colors.DEFAULT as ColorResolvable)
  .setDescription(
    `\`Samuel:\` Welcome, use the menu below to select which category you'd like to check out`
  )
  .addFields({
    name: "💍 Rings",
    value: `DynastySue Jewels, the most overpriced rings you'll find in SueLuz!`
  });

export const ShopMenu: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new StringSelectMenuBuilder()
      .setCustomId("SueLuzShop")
      .setPlaceholder("Select A Category")
      .addOptions(
        {
          label: "Main Menu",
          value: "MainMenuShop",
          description: "Go back to the main menu",
          emoji: "ℹ️"
        },
        {
          label: "Ring Shop",
          value: "DynastySue",
          description: "Go to DynastySue, SueLuz",
          emoji: "💍"
        }
      )
  ]);

export const RingShop = new EmbedBuilder()
  .setTitle(`${emojis.MaxRank} DynastySue Jewels 💍`)
  .setColor("Gold")
  .setDescription(
    `\`Hannah:\` Welcome to DynastySue, use the buttons below to make a purchase!`
  )
  .addFields(
    {
      name: "Oval Diamond Ring",
      value: `\`₲ 50,000\``,
      inline: true
    },
    {
      name: "Heart Diamond Ring",
      value: `\`₲ 100,000\``,
      inline: true
    },
    {
      name: "Oval Musgravite Ring",
      value: "`₲ 200,000`",
      inline: true
    },
    {
      name: "Heart Musgravite Ring",
      value: "`₲ 250,000`",
      inline: true
    },
    {
      name: "Oval Painite Ring",
      value: "`₲ 1,000,000`",
      inline: true
    },
    {
      name: "Heart Painite Ring",
      value: "`₲ 1,500,000`",
      inline: true
    },
    {
      name: "Heart Pink Star Ring",
      value: "`₲ 4,600,000`",
      inline: true
    }
  )
  .setFooter({
    text: `Refunds are not available | DynastySue, SueLuz`
  });

export const OvalRings: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("ODR")
      .setLabel("Oval Diamond Ring")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("OMR")
      .setLabel("Oval Musgravite Ring")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("OPR")
      .setLabel("Oval Painite Ring")
      .setStyle(ButtonStyle.Secondary)
  ]);

export const HeartRings: ActionRowBuilder<any> =
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setCustomId("HDR")
      .setLabel("Heart Diamond Ring")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("HMR")
      .setLabel("Heart Musgravite Ring")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("HPR")
      .setLabel("Heart Painite Ring")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("HPSR")
      .setLabel("Heart Pink Star Ring")
      .setStyle(ButtonStyle.Secondary)
  ]);

export enum RingCustomIds {
  "Oval Diamond Ring" = "ODR",
  "Oval Musgravite Ring" = "OMR",
  "Oval Painite Ring" = "OPR",
  "Heart Diamond Ring" = "HDR",
  "Heart Musgravite Ring" = "HMR",
  "Heart Painite Ring" = "HPR",
  "Heart Pink Star Ring" = "HPSR"
}