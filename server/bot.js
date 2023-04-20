import { Telegraf } from 'telegraf';

import logger from './logger.js';
import config from './config.js';

import { clearPendingMessages, restrictConvoToOnlyHuman } from './bot_helpers.js';



export let bot = null;



export async function initBot() {
    console.log("Starting bot...");

    bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    await clearPendingMessages();

    bot.launch();
    setupBot(bot);
}






export async function setupBot(bot) {

    try {
        const botInfo = await bot.telegram.getMe();
        console.log('Bot Details:', botInfo);
    } catch (error) {
        console.error('Error getting bot details:', error);
    }


    bot.command('start', async ctx => {
        console.log("start command called - CHAT ID: ", ctx.chat.id, " - FROM: ", ctx.from.username, "User ID: ", ctx.from.id);
    });




    // NOTE: THIS NEEDS TO BE LAST!!!
    // TODO: turn this into a modal kind of thing... where the user can enter messages (that will be deleted).. but the context is whatever inline keyboard is currently showing.  Easy to set a global where the bot keeps track of which "mode" it is in.
    // This is a catch-all for any messages that are not commands.
    bot.on('message', ctx => {
        //ctx.reply("WARNING: I only respond to commands.  You can always /start again if you need.");

        ctx.reply("hello - I don't do anything yet.")
    })


    //// 'MIDDLEWARE' THAT RESTRICTS WHICH USER THE BOT WILL RESPOND TO ////
    // bot.use((ctx, next) => {
    //     if (ctx.from.id.toString() === config.HUMAN_OWNER) {
    //         return next();
    //     } else {
    //         console.log(`Unauthorized access attempt by user ID: ${ctx.from.id}`);
    //         ctx.reply(`You are not authorized to use this bot - go away!`);
    //     }
    // });
    bot.use(restrictConvoToOnlyHuman);

    //// SAY HELLO
    try {
        await bot.telegram.sendMessage(config.HUMAN_OWNER, `Hello,\nI'm awake and ready to /start`);
    } catch (error) {
        // if (error instanceof Telegraf.TelegramError && error.description === 'Bad Request: chat not found') {
        if (error.response && error.response.error_code === 400 && error.response.description === 'Bad Request: chat not found') {
            logger.error("This bot can't initiate a chat with a user.  The user has to initiate.  Start a chat with this bot before running this app.  Just pull up the bot and say anything.", error);
        } else {
            logger.error("Error while sending \'I'm awake\' message:", error);
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
            // } else {
            // console.log(bot);
        }

        // TODO: TELL THE USER THAT THE BOT IS SHUTTING DOWN

        try {
            await bot.stop();
            resolve();
        } catch (error) {
            logger.error("ERROR: bot.stop() failed:", error);
            reject(error);
        }
    });
};
