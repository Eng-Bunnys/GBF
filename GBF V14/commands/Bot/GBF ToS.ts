const SlashCommand = require("../../utils/slashCommands").default;

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import { Client, ColorResolvable, EmbedBuilder } from "discord.js";

export default class GBF_ToS extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "gbf-tos",
      category: "Bot",
      description: "GBF's ToS for general use and what we collect",

      devOnly: false,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: false,
      Partner: false
    });
  }

  async execute({ client, interaction }) {
    const ToS_Embed = new EmbedBuilder()
      .setTitle(`${emojis.LOGOTRANS} GBF Terms of service and privacy policy`)
      .setColor(colours.DEFAULT as ColorResolvable)
      .addFields(
        {
          name: `GBF Bot`,
          value: `By using GBF Bot or DunkelLuz services you agree to our terms and conditions\nYour agreement with us includes these Terms and our Privacy Policy (“Agreements”). You acknowledge that you have read and understood Agreements, and agree to be bound of them.\n\nIf you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at gbfofficesteam@gmail.com so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.\n\nAny contests, sweepstakes or other promotions made available through Service may be governed by rules that are separate from these Terms of Service. If you participate in any Promotions, please review the applicable rules as well as our Privacy Policy. If the rules for a Promotion conflict with these Terms of Service, Promotion rules will apply.`
        },
        {
          name: "Accounts",
          value: `When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on Service.\n\nYou are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.\n\nWe may terminate or suspend your account and bar access to Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of Terms.`
        },
        {
          name: "Data",
          value: `This section will talk about the data that is collected and stored on our services, this section will not include what GBF has access to since this is determined by the user.`
        },
        {
          name: "Data [GBF Bot]",
          value: `By using GBF Bot you agree to give us access to the following information:\n\`Logging:\`\n• Guild ID\n• Logging Channel ID\n\nNo data is collected if basic GBF is used.`
        },
        {
          name: "Data [DunkelLuz]",
          value: `By using DunkelLuz services you agree to give us access to the following information:\n• User ID\n• DunkelLuz Account creation date\n• DunkelLuz Account details (Password and Username)\n• Account rank\n• Cash in wallet\n• Money in bank\n• Total net worth\n• Total cash earned\n• Total RP earned`
        },
        {
          name: "Timer System",
          value: `By using GBF Timers you agree to give us access to the following information:\n• User ID\n• Time that you use the timer system\n• ID of the timer you're using\n• Topic of the session`
        }
      );

    return interaction.reply({
      embeds: [ToS_Embed],
      ephemeral: true
    });
  }
}
