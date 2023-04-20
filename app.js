import logger from './server/logger.js';
import config from './server/config.js';
import { initBot } from './server/bot.js';
import { checkENV, closeApp } from './server/helpers.js';

logger.info(">> running app.js");
checkENV();


process.on("SIGINT", closeApp);
process.on("SIGTERM", closeApp);

process.on('uncaughtException', (error) => {
    logger.log(" ++++++++++ uncaught exception ++++++++++ ");
    logger.error(error);
});


initBot();
