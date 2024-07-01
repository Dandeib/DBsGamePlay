import { z } from "zod";

const envVariables = z.object({
  BOT_TOKEN: z.string(),
  APP_ID: z.string(),
  CLIENT_ID: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
