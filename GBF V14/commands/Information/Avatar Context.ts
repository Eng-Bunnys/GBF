import GBFClient from "../../handler/clienthandler";
import { ImageModel } from "../../schemas/Beastars Schemas/Images Schema";
import SlashCommand from "../../utils/slashCommands";

import {
  ApplicationCommandType,
  MessageContextMenuCommandInteraction
} from "discord.js";

interface IExecute {
  client: GBFClient;
  interaction: MessageContextMenuCommandInteraction;
}

export default class AddImageContext extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "get image",
      category: "General",
      type: ApplicationCommandType.Message,

      development: true,
      dmEnabled: false
    });
  }

  async execute({ client, interaction }: IExecute) {
    let ImageData = await ImageModel.findOne({
      guildID: interaction.guildId
    });

    if (!ImageData) {
      ImageData = new ImageModel({
        guildID: interaction.guildId
      });

      await ImageData.save();
    }

    const TargetImage = ImageData.image?.find((image) =>
      interaction.targetMessage.content
        .toLowerCase()
        .split(" ")
        .includes(image.name.toLocaleLowerCase())
    );

    if (!TargetImage)
      return interaction.reply({
        content: `I couldn't find ${interaction.targetMessage.content}, use b! add [name] [url] to add it!`,
        ephemeral: true
      });

    return interaction.reply({
      content: `${TargetImage.URL}`
    });
  }
}
