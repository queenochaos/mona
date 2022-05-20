import { Client } from "../../deps/harmony.ts";
import Dispatcher from "./Dispatcher.ts";
import Registry from "./Registry.ts";

import type { ClientOptions } from "../../deps/harmony.ts";
import Command from "./Command.ts";
import MessageCommand from "./MessageCommand.ts";
type Constructor<I> = new (...args: any[]) => I;

interface QueenOptions {
}

export class Queen extends Client {
  dispatcher: Dispatcher;
  registry: Registry;
  constructor(options: ClientOptions, clientID: string, token: string) {
    super(options);
    this.dispatcher = new Dispatcher(this);
    this.registry = new Registry(this, clientID, token);
    this.on("raw", (evt, d, s) => {
      if (evt === "INTERACTION_CREATE") {
        if (d.type === 2) return this.dispatcher.handle(d);
      }
      if (evt === "MESSAGE_CREATE") {
        if (d.content) {
          return this.dispatcher.handleMessage(d);
        }
      }
    });
  }
  async registerCommands(
    Commands: Record<string, Constructor<Command>> | null,
    MessageCommands?: Record<string, Constructor<MessageCommand>>,
  ) {
    if (Commands) {
      console.log(Command);
      Object.entries(Commands).forEach(([commandName, commandHandler]) => {
        console.log("/", commandName);
        this.registry.registerCommand(commandHandler as Constructor<Command>);
      });
    }
    if (MessageCommands) {
      Object.entries(MessageCommands).forEach(
        ([commandName, commandHandler]) => {
          console.log("@", commandName);
          this.registry.registerMessageCommand(
            commandHandler as Constructor<MessageCommand>,
          );
        },
      );
    }
    return [Commands, MessageCommands];
  }
}
