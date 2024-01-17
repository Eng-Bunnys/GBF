import { Events } from "discord.js";
import { GBF } from "../handler/GBF";

export default function botReady(client: GBF) {
  client.on(Events.ClientReady, async () => {
    console.log(`${client.user.username} is now online, using GBF Handler`);
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.log(
        "[ERROR] Unhandled Rejection at: Promise ",
        promise,
        " reason: ",
        reason.message
      );
    });
  });

  process.on("uncaughtException", (err: Error, origin: string) => {
    console.log(`Caught uncaughtException: ${err}`);
  });
}
