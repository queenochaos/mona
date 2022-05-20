const globalURL = (id: string) => `https://discord.com/api/v10/applications/${id}/commands`;
const guildURL = (id: string, guild: string) => `https://discord.com/api/v10/applications/${id}/guilds/${guild}/commands`;


import type { Queen } from "./Client.ts";
import { BetterMap } from "../util.ts";
import Command from "./Command.ts";
import MessageCommand from "./MessageCommand.ts";
type Constructor<I> = new (...args: any[]) => I;

class Registry {
  client: Queen;
  client_id: string;
  commands: BetterMap<string, Command>;
  messageCommands: BetterMap<string, MessageCommand>;
  _token: string;
  constructor(client: Queen, clientID: string, token: string) {
    this.client = client;
    this.client_id = clientID
    this.commands = new BetterMap("Commands");
    this.messageCommands = new BetterMap("MessageCommands");
    this._token = token;
  }
  async reRegisterAll() {
    return this.updateCommands(this.commands.array());
  }
  registerCommand(command: Constructor<Command>) {
    const cmd = new command(this.client);
    this.commands.set(cmd.name, cmd);
    return cmd;
  }
  registerMessageCommand(command: Constructor<MessageCommand>) {
    const cmd = new command(this.client);
    this.messageCommands.set(cmd.name, cmd);
    return cmd;
  }

  async updateCommand(command: Command, guild?: string) {
    const cmdjson = command.json();
    const resp = await fetch(guild ? guildURL(this.client_id, guild) : globalURL(this.client_id), {
      method: "POST",
      headers: {
        Authorization: `Bot ${this._token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmdjson),
    });
    const res = await resp.json();
    return res;
  }
  async updateCommands(commands: Command[], guild?: string) {
    const cmdjson = commands.map((x) => x.json());
    const resp = await fetch(guild ? guildURL(this.client_id, guild) : globalURL(this.client_id), {
      method: "PUT",
      headers: {
        Authorization: `Bot ${this._token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmdjson),
    });
    const res = await resp.json();
    return res;
  }
  async registerIfNot() {
    const registered = await this.fetchCommands();
    const regArray = registered.map((x: Record<string, any>) => x.name);
    const toRegister = this.commands.filter((x) => !regArray.includes(x.name))
      .array();
    if (toRegister.length > 0) {
      const res = [];
      for (let cmd of toRegister) {
        await this.updateCommand(cmd);
        res.push(toRegister);
      }
      return res;
    }
    return false;
  }
  async fetchCommands(guild?: string) {
    const resp = await fetch(guild ? guildURL(this.client_id, guild) : globalURL(this.client_id), {
      method: "GET",
      headers: { Authorization: `Bot ${this._token}` },
    });
    const res = await resp.json();
    return res;
  }
}

export default Registry;
