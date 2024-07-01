import { eventHandler } from "./event-handler.js";
import { commandHandler } from "./command-handler.js";
import { contextHandler } from "./context-handler.js";

const handlers = {
  eventHandler,
  commandHandler,
  contextHandler
};

export { handlers };
