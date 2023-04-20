import { Telegraf } from 'telegraf';

import logger from './logger.js';
import config from './config.js';

import { clearPendingMessages, restrictConvoToOnlyHuman } from './bot_helpers.js';
import { handleUserMessage } from './bot_convo.js';



export let bot = null;



export async function initBot() {
    logger.info("Starting bot...");

    bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    await clearPendingMessages();

    bot.launch();
    setupBot(bot);
}






export async function setupBot(bot) {

    try {
        const botInfo = await bot.telegram.getMe();
        // logger.info(`Bot Details: ${botInfo}`);
        // logger.info('Bot Details:');
        // logger.info(botInfo);

        // TODO: this may not be the best way to do this... but it works for now...
        if (config.debug)
            console.log(botInfo);

    } catch (error) {
        logger.error(`Error getting bot details: ${error}`);
    }

    bot.use(restrictConvoToOnlyHuman);

    bot.command('start', async ctx => {
        logger.info(`start command called - CHAT ID: ${ctx.chat.id} - FROM: ${ctx.from.username} User ID: ${ctx.from.id}`);
    });

    // bot.on('message', ctx => {
    //     //ctx.reply("WARNING: I only respond to commands.  You can always /start again if you need.");

    //     ctx.reply("hello - I don't do anything yet.")
    // })
    bot.on('message', handleUserMessage);


    //// SAY HELLO
    try {
        await bot.telegram.sendMessage(config.HUMAN_OWNER, `Hello,\nI'm awake and ready to /start`);
    } catch (error) {
        // if (error instanceof Telegraf.TelegramError && error.description === 'Bad Request: chat not found') {
        if (error.response && error.response.error_code === 400 && error.response.description === 'Bad Request: chat not found') {
            logger.error(`This bot can't initiate a chat with a user.  The user has to initiate.  Start a chat with this bot before running this app.  Just pull up the bot and say anything. ${error}`);
        } else {
            logger.error(`Error while sending \'I'm awake\' message: ${error}`);
        }
    }
}


export async function killBot() {
    return new Promise(async (resolve, reject) => {
        logger.warn("killing bot...");

        if (bot === null) {
            logger.warn("bot is null - nevermind...");
            resolve();
            return;
        }

        // TODO: TELL THE USER THAT THE BOT IS SHUTTING DOWN

        try {
            await bot.stop();
            resolve();
        } catch (error) {
            logger.error(`ERROR: bot.stop() failed: ${error}`);
            reject(error);
        }
    });
};
