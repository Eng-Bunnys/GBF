import { Client } from "discord-rpc";
///To-Do: Complete the rest of the options
export class DiscordRPC {
  private RPC: Client;
  private ClientID: string;
  private Connected: boolean;

  constructor(ClientID: string) {
    this.ClientID = ClientID;

    this.RPC = new Client({
      transport: "ipc",
    });

    this.Connected = false;

    this.RPC.on("ready", () => {
      console.log("Discord RPC is ready");
      this.Connected = true;
    });

    this.RPC.login({
      clientId: this.ClientID,
    }).catch((RPCConnectError) => console.error(RPCConnectError));
  }

  public setActivity(Details?: string, State?: string) {
    if (!this.Connected) {
      console.warn("RPC is not connected.");
      return;
    }

    this.RPC.setActivity({
      details: Details,
      state: State,
    });
  }

  public Disconnected() {
    if (this.Connected) {
      {
        this.RPC.clearActivity();
        this.RPC.destroy();
        this.Connected = false;
      }
    }
  }
}
