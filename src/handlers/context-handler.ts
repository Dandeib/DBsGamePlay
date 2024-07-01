import * as fs from "fs";
import path from "path";
import {
  REST,
  Routes,
  Collection,
  Client,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  Events,
} from "discord.js";
import { logger } from "$LOGGER";

/**
 * Handles commands for the client.
 * @param client The Discord client.
 */
const contextHandler = async (client: Client) => {
  //@ts-ignore
  client.contexts = new Collection<string, unknown>();
  const contextData: any = [];

  const contextsPath = path.join(process.cwd(), "src", "contexts");
  logger.info(`[context-handler.ts][contextsPath]: ${contextsPath}`);

  const contextFolder = fs.readdirSync(contextsPath);

  for (const folder of contextFolder) {
    const FolderPath = path.join(contextsPath, folder);
    const stat = fs.statSync(FolderPath);

    if (!stat.isDirectory()) return;
    if (folder === "user" || folder === "content" || folder === "chatinput") {
      const typeFolder = fs.readdirSync(path.join(FolderPath));

      for (const file of typeFolder) {
        if (!file.endsWith(".ts")) return;

        const contextFileModule = await import(
          `file://${path.join(FolderPath, file)}`
        );
        const contextFile = contextFileModule.default;

        if (!contextFile.name) return logger.error(`No name in ${file}`);

        const context = new ContextMenuCommandBuilder();
        context.setName(contextFile.name);

        switch (folder.toLowerCase()) {
          case "user": {
            context.setType(ApplicationCommandType.User);
            break;
          }
          case "message": {
            context.setType(ApplicationCommandType.Message);
            break;
          }
          case "chatinput": {
            //@ts-ignore
            context.setType(ApplicationCommandType.ChatInput);
          }
        }

        if (contextFile.default_member_permission) {
          context.setDefaultMemberPermissions(
            contextFile.default_member_permission
          );
        }

        //@ts-ignore
        client.contexts.set(contextFile.name, contextFile);
        contextData.push(context);
      }
    } else {
      return;
    }
  }

  const rest = new REST().setToken(process.env.BOT_TOKEN as string);

  try {
    logger.info("[context-handler.ts][contexts]: Refreshing contexts.");

    await rest
      .put(Routes.applicationCommands(process.env.CLIENT_ID as string), {
        body: contextData,
      })
      .then(() => {
        logger.info("[context-handler.ts][contexts]: Reload contexts.");
      });
  } catch (e) {
    logger.error(e);
  }

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isUserContextMenuCommand()) return;

    //@ts-ignore
    const context = client.contexts.get(interaction.commandName);

    if (context) {
      try {
        await context.execute(interaction, client);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

export { contextHandler };
