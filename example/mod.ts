import { Harmony, Queen } from "../mod.ts";
import { ClientID, Discord } from "./secret.js";

import * as commands from "./commands/mod.ts";
import * as messageCommands from "./messageCommands/mod.ts";

const {
  GatewayIntents,
} = Harmony;

const client = new Queen({ enableSlash: true }, ClientID);

console.log(await client.registerCommands(commands, messageCommands));

client.connect(Discord, [
  GatewayIntents.DIRECT_MESSAGES,
  GatewayIntents.GUILDS,
  GatewayIntents.GUILD_MESSAGES,
]);
