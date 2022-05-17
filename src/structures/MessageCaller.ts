import { User } from "../../deps/harmony.ts";

import type { MessagePayload } from "../../deps/harmony.ts";
import type { Queen } from "./Client.ts";

export interface MessageCallerData {
  name: string;
}

export class MessageCaller {
  client: Queen;
  message: MessagePayload;
  command: string;
  content: string;
  channel: string;
  mentions: unknown[];
  originalMessage: { channel: string | null; message: string | null };
  author: User;
  constructor(client: Queen, data: MessageCallerData, message: MessagePayload) {
    this.client = client;
    this.message = message;
    this.command = data.name;
    this.content = message.content;
    this.channel = message.channel_id;
    this.mentions = message.mentions || [];
    this.originalMessage = {
      channel: null,
      message: null,
    };

    this.author = new User(this.client, message.author);
  }
  get createdAt() {
    return MessageCaller.getCreatedAt(Number(this.message.id));
  }

  static getCreatedAt(id: number) {
    return MessageCaller.getDiscordEpoch(id) + 1420070400000;
  }

  static getDiscordEpoch(id: number) {
    return Math.floor(id / 4194304);
  }
  async createMessage(content: string | Record<string, unknown>) {
    const originalMessage = await this.client.channels.sendMessage(
      this.channel,
      content,
    );
    this.originalMessage.channel = originalMessage.channel.id;
    this.originalMessage.message = originalMessage.id;
  }
  async edit(content: string | Record<string, unknown>) {
    if (!this.originalMessage.channel || !this.originalMessage.message) {
      console.error("NO ORIGINAL MESSAGE");
      return false;
    }
    await this.client.channels.editMessage(
      this.originalMessage.channel,
      this.originalMessage.message,
      content,
    );
  }
}
export default MessageCaller;
