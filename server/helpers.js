import config from './config.js';
import logger from './logger.js';

import { killBot } from './bot.js';


export async function checkENV() {
    logger.info(`DEBUG: ${config.debug}`);

    if (config.debug) {
        logger.info("DEBUG mode is ON");
    } else {
        logger.info("DEBUG mode is OFF");
    }

    let fatal = false;

    if (config.TELEGRAM_BOT_TOKEN === undefined ||
        config.TELEGRAM_BOT_TOKEN === "") {
        logger.error("TELEGRAM_BOT_TOKEN is not defined in .env");
        fatal = true;
    }
    if (config.OPENAI_API_KEY === undefined ||
        config.OPENAI_API_KEY === "") {
        logger.error("OPENAI_API_KEY is not defined in .env");
        fatal = true;
    }
    if (config.NOSTR_PRIVATE_KEY === undefined ||
        config.NOSTR_PRIVATE_KEY === "") {
        logger.error("NOSTR_PRIVATE_KEY is not defined in .env");
        fatal = true;
    }
    if (config.HUMAN_OWNER === undefined ||
        config.HUMAN_OWNER === "") {
        logger.error("HUMAN_OWNER is not defined in .env");
        fatal = true;
    }

    if (fatal) {
        logger.error("Encountered a fatal error - exiting...");
        process.exit(1);
    }

    logger.info("Environment variables are OK");
}


let closingInProgress = false;
//NOTE: TODO: we have to ensure that every possible exception is covered in try{} blocks or else the app will not close...
export async function closeApp() {
    // NOTE: there was once an uncaught exception that prevented the app from closing.  Next time I pressed Control-C this code prevented closeApp() from running...
    if (closingInProgress) {
        logger.info("App is already closing. Ignoring signal.");
        return;
    }

    closingInProgress = true;

    logger.info("Closing app...");
    try {
        await killBot();
        logger.info("Closed app successfully");
        process.exit(0);
    } catch (error) {
        logger.error(`Error closing app: ${error}`);
        process.exit(1);
    }
}
