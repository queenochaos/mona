import type {
  Guild,
  InteractionApplicationCommandData,
  InteractionApplicationCommandOption,
  InteractionPayload,
} from "../../deps/harmony.ts";
import {
  InteractionType,
  Role,
  TextChannel,
  User,
} from "../../deps/harmony.ts";
import type { Queen } from "./Client.ts";

export type CallerOptions = Record<
  string,
  string | number | User | TextChannel | {
    name: string;
    options: Record<string, string | number | User | TextChannel> | null;
  }
>;

export class Caller {
  client: Queen;
  message: InteractionPayload;
  id: string;
  appId: string;
  guild_id: string;
  //  guild: Guild;
  channel: string | undefined;
  token: string;
  command: string;
  type: number;
  options: CallerOptions | null;
  responded: boolean;
  author: User | null;
  constructor(client: Queen, message: InteractionPayload) {
    if (message.type !== InteractionType.APPLICATION_COMMAND) {
      throw "Not an Application Command";
    }
    this.client = client;
    this.message = message;
    this.id = message.id;
    this.appId = message.application_id;
    this.guild_id = message.guild_id || "";
    //    this.guild = guild;
    this.channel = message.channel_id;
    this.token = message.token;
    const messageData = (message.data as InteractionApplicationCommandData);
    this.command = messageData.name || "dummy";
    this.type = message.type;
    this.options = null;
    this.responded = false;
    if (messageData && messageData.options) {
      this.options = messageData.options.reduce(
        (
          acc: CallerOptions,
          curr: InteractionApplicationCommandOption,
        ) => {
          if ([3, 4, 5, 8, 10, 11].includes(curr.type)) {
            acc[curr.name] = curr.value;
          } else if (curr.type === 6) {
            if (messageData.resolved?.users?.[curr.value]) {
              acc[curr.name] = new User(
                this.client,
                messageData.resolved.users[curr.value],
              );
            }
          } else if (curr.type === 7) {
            if (messageData.resolved?.channels?.[curr.value]) {
              acc[curr.name] = new TextChannel(
                this.client,
                messageData.resolved.channels[curr.value],
              );
            }
          } /*else if (curr.type === 8) {
            if (messageData.resolved?.roles?.[curr.value]) {
              acc[curr.name] = new Role(
                this.client,
                messageData.resolved.roles[curr.value],
                this.guild,
              );
            }
          }*/ else if (curr.type === 9) {
            if (messageData.resolved?.users?.[curr.value]) {
              acc[curr.name] = new User(
                this.client,
                messageData.resolved.users[curr.value],
              );
            }
          } else {
            acc["subcommand"] = {
              name: curr.name,
              options: curr.options?.length
                ? curr.options?.reduce(
                  (
                    acc2: Record<string, string | User | TextChannel>,
                    curr2: InteractionApplicationCommandOption,
                  ) => {
                    if ([3, 4, 5, 8, 10, 11].includes(curr2.type)) {
                      acc2[curr2.name] = curr2.value;
                    } else if (curr2.type === 6) {
                      if (messageData.resolved?.users?.[curr2.value]) {
                        acc2[curr2.name] = new User(
                          this.client,
                          messageData.resolved.users[curr2.value],
                        );
                      }
                    } else if (curr2.type === 7) {
                      if (messageData.resolved?.channels?.[curr2.value]) {
                        acc2[curr2.name] = new TextChannel(
                          this.client,
                          messageData.resolved.channels[curr2.value],
                        );
                      }
                    } /*else if (curr.type === 8) {
                      if (messageData.resolved?.roles?.[curr.value]) {
                        acc[curr.name] = new Role(
                          this.client,
                          messageData.resolved.roles[curr.value],
                          this.guild,
                        );
                      }
                    }*/
                    else if (curr2.type === 9) {
                      if (messageData.resolved?.users?.[curr2.value]) {
                        acc2[curr2.name] = new User(
                          this.client,
                          messageData.resolved.users[curr2.value],
                        );
                      }
                    }
                    return acc2;
                  },
                  {} as Record<string, string | User | TextChannel>,
                )
                : null,
            };
          }
          return acc;
        },
        {},
      );
    }
    /*
    if (data.resolved) {
      for (let item in data.resolved) {
        for (let stuff of data.resolved[item].values()) {
          this.mentions[item].set(stuff.id, stuff);
        }
      }
    }
    */
    this.author = message.user
      ? new User(this.client, message.user)
      : message.member
      ? new User(this.client, message.member.user)
      : null;
  }
  get createdAt() {
    return Caller.getCreatedAt(Number(this.id));
  }

  static getCreatedAt(id: number) {
    return Caller.getDiscordEpoch(id) + 1420070400000;
  }

  static getDiscordEpoch(id: number) {
    return Math.floor(id / 4194304);
  }
  async createMessage(content: string | Record<string, unknown>) {
    if (typeof content === "string") content = { content: content };
    if (!this.responded) return this.respond(content);
    return await this.createFollowUp(content);
  }
  async createFollowUp(content: string | Record<string, unknown>) {
    await this.client.rest.post(
      `https://discord.com/api/v10/webhooks/${this.appId}/${this.token}`,
      content,
    );
  }
  async edit(content: string | Record<string, unknown>) {
    if (typeof content === "string") content = { content };
    await this.client.rest.patch(
      `https://discord.com/api/v10/webhooks/${this.appId}/${this.token}/messages/@original`,
      content,
    );
  }
  async respond(content: string | Record<string, unknown>) {
    await this.client.rest.post(
      `https://discord.com/api/v10/interactions/${this.id}/${this.token}/callback`,
      { type: 4, data: content },
    );
    this.responded = true;
  }
}
export default Caller;
