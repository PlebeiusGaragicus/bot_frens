import logger from "./logger.js";
import config from "./config.js";
import { bot } from "./bot.js";


// {
//     update_id: 980832792,
//     message: {
//       message_id: 150,
//       from: {
//         id: 2005851250,
//         is_bot: false,
//         first_name: 'pineapple',
//         last_name: 'treehouse',
//         username: 'pineappletreehouse',
//         language_code: 'en'
//       },
//       chat: {
//         id: 2005851250,
//         first_name: 'pineapple',
//         last_name: 'treehouse',
//         username: 'pineappletreehouse',
//         type: 'private'
//       },
//       date: 1682177783,
//       text: 'asfd'
//     }
//   }
export async function clearPendingMessages() {
    let updates = await bot.telegram.getUpdates();

    for (const update of updates) {
        // TODO: this fucking thing just shows [object Object]... NEED TO FIX THE LOGGER
        logger.info(`ignoring update from (${update.message.chat.username}) while bot was offline: '${update.message.text}'`);
        await bot.handleUpdate(update);
    }
}


export function restrictConvoToOnlyHuman(ctx, next) {
    if (ctx.from.id.toString() === config.HUMAN_OWNER) {
        return next();
    } else {
        logger.warn(`Unauthorized access attempt by user ID: ${ctx.from.id}`);
        ctx.reply(`You are not authorized to use this bot - go away!`);
    }
}
