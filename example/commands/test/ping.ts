import { Command } from "../../../mod.ts";
import type { Caller, Queen } from "../../../mod.ts";

export default class PingCommand extends Command {
  constructor(client: Queen) {
    super(client, {
      name: "ping",
      description: "Check the bot's ping to the server.",
      group: "util",
      options: [],
    });
  }
  async run(command: Caller) {
    await command.createMessage("Pinging...");
    command.edit(
      `Pong right back at you in ${(Date.now()) - (command.createdAt)}ms.`,
    );
    return null;
  }
}
