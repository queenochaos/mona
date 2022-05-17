import type {Queen} from "./Client.ts"
import type {Caller} from "./Caller.ts"

export interface CommandPayload {
  name: string;
  description: string;
  group: string;
  nsfw?: boolean;
  textOnly?: boolean | undefined;
  options: CommandOption[];
}

export interface CommandOption {
  name: string;
  description: string;
  type: number;
  required?: boolean | undefined;
  choices?: CommandOptionChoices[] | undefined;
  options?: CommandOption | undefined,
}
export interface CommandOptionChoices {
  name: string;
  value: string|number;
}

export class Command {
  client: Queen;
  name: string;
  description: string;
  group: string;
  nsfw: boolean;
  textOnly: boolean | undefined;
  options: CommandOption[];
  constructor(client: Queen, data: CommandPayload) {
    this.validateInfo(data);
    this.client = client;
    this.name = data.name;
    this.description = data.description || "";
    this.group = data.group;
    this.nsfw = data.nsfw ? true : false;
    this.textOnly = Boolean(data.textOnly);
    this.options = data.options;
  }
  validateInfo(data: CommandPayload) {
    if (!data.name || data.name.length > 32) {
      throw new Error(`Name for ${data.name} is invalid.`);
    }
    if (data.description && data.description.length > 100) {
      throw new Error(`Description for ${data.name} is invalid.`);
    }
    if (!data.group || data.group.length > 32) {
      throw new Error(`Group ${data.group} for ${data.name} is invalid.`);
    }
  }
  async update() {
    return await this.client.registry.updateCommand(this);
  }
  json() {
    return {
      name: this.name,
      description: this.description,
      type: 1,
      options: Array.isArray(this.options)
        ? this.options.map((x) => ({
          name: x.name,
          description: x.description,
          type: x.type,
          required: x.required || false,
          choices: x.choices || null,
          options: x.options || null,
        }))
        : [],
    };
  }
  async run(message: Caller) {
    return null;
  }
}
export default Command;