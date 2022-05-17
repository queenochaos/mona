import type {Queen} from "./Client.ts"
import type {MessageCaller} from "./MessageCaller.ts"

export interface MessageCommandPayload {
  name: string;
  aliasPattern: RegExp;
  description: string;
  nsfw?: boolean;
  textOnly?: boolean | undefined;
}
export class MessageCommand {
  client: Queen;
  name: string;
  aliasPattern: RegExp;
  description: string;
  nsfw: boolean;
  textOnly: boolean | undefined;
    constructor(client: Queen, data: MessageCommandPayload) {
      this.validateInfo(data);
      this.client = client;
      this.name = data.name;
      this.aliasPattern = data.aliasPattern || new RegExp(`${this.name}`, "i")
      this.description = data.description || "";
      this.nsfw = data.nsfw ? true : false;
    }
    validateInfo(data: MessageCommandPayload) {
      if (!data.name || data.name.length > 32) {
        throw new Error(`Name for ${data.name} is invalid.`);
      }
      if (data.description && data.description.length > 100) {
        throw new Error(`Description for ${data.name} is invalid.`);
      }
    }
    json() {
      return {
        name: this.name,
        description: this.description,
        type: 1,
      };
    }
    async run(message: MessageCaller) {
      return null;
    }
  }
  export default MessageCommand;
  