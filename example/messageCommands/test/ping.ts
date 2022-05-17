import {MessageCommand} from "../../../mod.ts";
import type { MessageCaller, Queen } from "../../../mod.ts";

/*
 * To Parse Mentions in a command aliasPattern, add this part to the regexp
 * /<@!?${"client-id-here"}>/
 */

export default class PingCommand extends MessageCommand {
  constructor(client: Queen) {
    super(client, {
      name: "ping",
      aliasPattern: new RegExp("^(?:(?:(?:what)|(?:wot))'?s?\\s?(?:is)\\s?(?:(?:the)|(?:da))?\\s)ping", "i"),
      description: "Check the bot's ping to the server.",
    });
  }
  async run(command: MessageCaller) {
    await command.createMessage("Pinging...");
    command.edit(
      `Tis an insignificant number, ${
        (Date.now()) - command.createdAt
      }ms.`,
    );
    return null;
  }
}