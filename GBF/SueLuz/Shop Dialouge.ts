import { ColorResolvable, EmbedBuilder } from "discord.js";

import colors from "../GBFColor.json";
import emojis from "../GBFEmojis.json";

export const TransactionFailed = new EmbedBuilder()
  .setTitle(`${emojis.ERROR} You can't do that`)
  .setColor(colors.ERRORRED as ColorResolvable)
  .setDescription(
    `\`Hannah:\` Looks like you don't have enough funds for that purchase`
  );

export const CheapRing = new EmbedBuilder()
  .setTitle(`${emojis.VERIFY} Transaction Complete`)
  .setColor("Gold")
  .setDescription(
    `\`Hannah:\` Amazing choice, don't forget you can always upgrade later on when you have more money!`
  );

export const MidRangeRing = new EmbedBuilder()
  .setTitle(`${emojis.VERIFY} Transaction Complete`)
  .setColor("Gold")
  .setDescription(
    `\`Hannah:\` You have excellent taste, we hope to see you again!`
  );

export const ExpensiveRing = new EmbedBuilder()
  .setTitle(`${emojis.VERIFY} Transaction Complete`)
  .setColor("Gold")
  .setDescription(
    `\`Hannah:\` Wonderful choice! You won't regret your decision, I'm sure of it`
  );
