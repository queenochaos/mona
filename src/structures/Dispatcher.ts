import Caller from "./Caller.ts";
import MessageCaller from "./MessageCaller.ts";

import type { MessageCallerData } from "./MessageCaller.ts";
import type { InteractionPayload, MessagePayload } from "../../deps/harmony.ts";
import type { Queen } from "./Client.ts";




class Dispatcher {
  client: Queen;
  constructor(client: Queen) {
    this.client = client;
  }
  shouldHandle(message: InteractionPayload) {
    if (message.type !== 2) return false;
    return true;
  }
  shouldHandleMessage(message: MessagePayload) {
    if (!message.content) return false;
    if (message.author.bot) return false;
    return true;
  }
  async handle(message: InteractionPayload) {
    if (!this.shouldHandle(message)) return false;
    const command = new Caller(this.client, message);
    console.info(
      `${
        command.author?.username || "UNKNOWN USER"
      } ran command ${command.command}`,
    );
    const cmd = this.client.registry.commands.get(command.command);
    if (!cmd) {
      return command.createMessage({
        content:
          "This command is either temporarily unavailable or deleted. Please join our support server for help. https://discord.gg/A69vvdK",
        flags: 64,
      });
    }
    if (cmd.nsfw && command.channel) {
      console.log("NSFW!");
      const msgChannel = await this.client.channels.fetch(command.channel);
      if (!msgChannel.isText() || !msgChannel.isGuildText) return false;
      if (msgChannel.isGuildText() && !msgChannel.nsfw) {
        return command.createMessage({
          content: "This command can only be used in NSFW channels.",
          flags: 64,
        });
      }
    }
    try {
      cmd.run(command);
    } catch (e) {
      console.error(e);
    }
  }
  handleMessage(message: MessagePayload) {
    if (!this.shouldHandleMessage(message)) return false;
    const cmd = this.client.registry.messageCommands.find((x) => {
      console.log(x.aliasPattern.exec(message.content.toLowerCase()));
      return !!(x.aliasPattern.exec(message.content.toLowerCase()));
    });
    console.log(cmd?.name);
    if (!cmd) return false;
    const data: MessageCallerData = {
      name: cmd.name,
    };
    const command = new MessageCaller(this.client, data, message);
    return cmd.run(command);
  }
}

export default Dispatcher;
