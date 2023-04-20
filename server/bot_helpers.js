import config from "./config.js";
import { bot } from "./bot.js";

export async function clearPendingMessages() {
    let updates = await bot.telegram.getUpdates();

    for (const update of updates) {
        console.log("ignoring updates while bot was offline:", update);
        await bot.handleUpdate(update);
    }
}


export function restrictConvoToOnlyHuman(ctx, next) {
    if (ctx.from.id.toString() === config.HUMAN_OWNER) {
        return next();
    } else {
        console.log(`Unauthorized access attempt by user ID: ${ctx.from.id}`);
        ctx.reply(`You are not authorized to use this bot - go away!`);
    }
}

