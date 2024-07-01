import * as fs from "fs";
import path from "path";
import { logger } from "$LOGGER";
import { Client } from "discord.js";

const eventHandler = async (client: Client) => {
  const eventsPath = path.join(process.cwd(), "src", "events");
  logger.info(`[event-handler.ts][eventPath]: ${eventsPath}`);

  getFiles(eventsPath, client);
};

const getFiles = async (eventsPath: string, client: Client) => {
  const eventsFolder = fs.readdirSync(eventsPath);

  for (const items of eventsFolder) {
    const FolderPath = path.join(eventsPath, items);
    const stat = fs.statSync(FolderPath);

    if (!stat.isDirectory()) return;

    const eventFolder = fs.readdirSync(FolderPath);

    for (const file of eventFolder) {
      if (!file.endsWith(".ts")) return;

      const eventScriptModule = await import(
        `file://${path.join(FolderPath, file)}`
      );
      const eventScript = eventScriptModule.default;

      const event = path.basename(path.dirname(path.join(FolderPath, file)));
      logger.info(`[event-handler.ts][${event}]: Loaded ${file}`);

      if (eventScript.once) {
        client.once(event, (...args) => eventScript.execute(...args));
      } else {
        client.on(event, (...args) => eventScript.execute(...args, client));
      }
    }
  }
};

export { eventHandler };
