import { Events, Message } from "discord.js";
import GBFClient from "../../handler/clienthandler";

export default function Checker(client: GBFClient) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (
      message.guildId === "439890528583286784" &&
      message.author.id === "733374566231048212" &&
      message.content ===
        "https://tenor.com/view/little-man-little-dan-gif-21792394"
    ) {
      message.delete();
    }
  });
}