import * as fs from "fs";
import path from "path";
import { REST, Routes, Collection, Client } from "discord.js";
import { logger } from "$LOGGER";
import { log } from "winston";

/**
 * Handles commands for the client.
 * @param client The Discord client.
 */
const commandHandler = async (client: Client) => {
  // @ts-ignore
  client.commands = new Collection<string, unknown>();

  const commandsPath = path.join(process.cwd(), "src", "commands");
  logger.info(`[command-handler.ts][commandsPath]: ${commandsPath}`);

  const commandFiles = getAllCommandFiles(commandsPath);

  logger.info(`[command-handler.ts][commandFiles]: ${commandFiles}`);

  await registerCommands(client, commandsPath, commandFiles);

  for (const file of commandFiles) {
    const command = await import(`file://${file}`);

    // @ts-ignore
    client.commands.set(command.data.name, command);
  }

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // @ts-ignore
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    logger.info(
      `[command-handler.ts][interactionCreate]: Received command: "${interaction.commandName}" requested by "${interaction.user.tag}".`
    );

    try {
      command.execute(interaction, client);
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
};

/**
 * Recursively retrieves all command file paths within the given directory.
 * @param dir - The directory to search for command files.
 * @returns An array of file paths to command files.
 */
function getAllCommandFiles(dir: string): string[] {
  const commandFiles: string[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const subFiles = getAllCommandFiles(filePath);
      commandFiles.push(...subFiles);
    } else if (file.endsWith(".ts")) {
      commandFiles.push(filePath);
    }
  }

  return commandFiles;
}

/**
 * Registers the commands for the Discord bot.
 * @param client - The Discord client instance.
 * @param commandsPath - The path to the directory containing the command files.
 * @param commandFiles - An array of command file paths.
 */
async function registerCommands(
  client: Client,
  commandsPath: string,
  commandFiles: string[]
) {
  const rest = new REST().setToken(process.env.BOT_TOKEN as string);

  const commands = [];

  for (const file of commandFiles) {
    const command = await import(`file://${file}`);

    commands.push(command.data.toJSON());
  }

  try {
    logger.info(
      "[command-handler.ts][registerCommands]: Refreshing application (/) commands."
    );

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID as string, '222222548442546176'),
      {
        body: commands,
      }
    );

    logger.info(
      "[command-handler.ts][registerCommands]: Reloaded application (/) commands."
    );
  } catch (error) {
    logger.error(error);
  }
}

export { commandHandler };
