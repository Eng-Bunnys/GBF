import {
  ActionRowBuilder,
  ChannelType,
  Events,
  GuildMember,
  Message,
  User,
} from "discord.js";
import GBFClient from "../../handler/clienthandler";
import AvatarBuilder from "../../API/Get Avatar";

export default function AutoRespond(client: GBFClient) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;

    message.content = message.content.toLowerCase();

    if (!message.content.includes("gbf")) return;

    if (message.content.includes("avatar")) {
      let TargetUser: User;
      let TargetMember: GuildMember | null;

      if (message.content.includes("my")) {
        TargetUser = message.author;
        TargetMember = message.member;
      } else if (message.mentions.users.size > 0) {
        TargetUser = message.mentions.users.first();
        TargetMember = message.guild.members.cache.get(TargetUser.id) ?? null;
      }
      const Avatar = new AvatarBuilder(TargetUser, TargetMember);

      await message.reply({
        embeds: [Avatar.getEmbed()],
        components: [Avatar.getButtonRow() as ActionRowBuilder<any>],
      });

      return;
    }
  });
}
