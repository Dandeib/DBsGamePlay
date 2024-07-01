import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { handlers } from "./handlers/index.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Channel,
    Partials.User
  ]
});

handlers.eventHandler(client);
handlers.commandHandler(client);
handlers.contextHandler(client);

client.login(process.env.BOT_TOKEN);

export { client };
