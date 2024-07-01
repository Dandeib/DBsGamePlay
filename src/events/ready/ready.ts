import { ActivityType, Client } from "discord.js";
import { logger } from "$LOGGER";

export default {
  once: true,
  execute(client: Client) {
    logger.info(`[ready.ts] ${client.user?.tag} has logged in.`);

    client.user?.setActivity({name: 'DBsGamePlay', type: ActivityType.Playing})
  },
};