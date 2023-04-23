import fs from 'fs';
import { Configuration, OpenAIApi } from "openai";

import logger from './logger.js';
import config from './config.js';
import prompt from './prompt.js';



const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// ChatGPT says: "For example, the text-davinci-003 model has a maximum token limit of 4096 tokens."
const MAX_TOKENS = 4096;


// TODO: personality upgrades ;)
// let conversationHistory = config.systemPrompt;


async function sendPrompt(prompt, temperature = 0.5, max_tokens = 750) {
    try {
        logger.info(`sendPrompt():`)
        logger.info(prompt);
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            temperature: temperature,
            max_tokens: max_tokens,
            top_p: 1.0,
            frequency_penalty: 0.5,
            presence_penalty: 0.0,
            // stop: ['\nUser', '\nAssistant'],
        });
        const reply = response.data.choices[0].text.trim();
        logger.info("sendPrompt() - reply:")
        logger.info(reply);
        return reply;
    } catch (error) {
        logger.error(`Error sending message to ChatGPT:`);
        logger.error(error);
        return null;
    }
}







////////////////////////////////////////////////////////////////////////////////////////
// THE MEATS AND THE POTATOES, PRECIOUS... MMMMMMMmmmmm... Filty Hobbitses...
////////////////////////////////////////////////////////////////////////////////////////


// conversationHistory += `User: ${userMessage}\nAssistant:`;
//...
// Add the assistant's response to the conversation history
// conversationHistory += ` ${reply}`;
export async function handleUserMessage(ctx) {
    logger.info(`handleUserMessage() - FROM: ${ctx.from.username} User ID: ${ctx.from.id}: ${ctx.message.text}`);

    // ctx.replyWithChatAction('typing');
    // ctx.sendChatAction('typing');]

    const userMessage = ctx.message.text;

    const filterPrompt = `SPEAKER: ${userMessage}\n${prompt.filter}`;
    const filterReply = await sendPrompt(filterPrompt, 0.5, 600); // LOW TEMPERATURE
    if (filterReply === null) {
        ctx.reply("I'm sorry, but I'm unable to respond at the moment.");
        return;
    }


    const augmentPrompt = `${prompt.augment}\n\nDIGEST OF USER MESSAGE: ${filterReply}}`;
    const augmentReply = await sendPrompt(augmentPrompt, 0.8, 900);
    if (augmentReply === null) {
        ctx.reply("I'm sorry, but I'm unable to respond at the moment.");
        return;
    }

    const coherancePrompt = `${prompt.cohere}\n\nREPLIES: ${augmentReply}`;
    const coheranceReply = await sendPrompt(coherancePrompt, 1.2, 900);
    if (coheranceReply === null) {
        ctx.reply("I'm sorry, but I'm unable to respond at the moment.");
        return;
    }

    // Save conversation to a file
    const currentTime = Math.floor(Date.now() / 1000);
    const fileName = `reply_${currentTime}.md`;
    const chatFolder = `./chat-log/${ctx.from.id}`;
    const conversationData = `
# filterPrompt:

${filterPrompt}

---

## filterReply:

${filterReply}


# augmentPrompt:

${augmentPrompt}

---

## augmentReply:

${augmentReply}


# coherencePrompt:

${coherancePrompt}

---

## coherenceReply:

${coheranceReply}
`;


    try {
        await fs.promises.mkdir(chatFolder, { recursive: true });
        await fs.promises.writeFile(`${chatFolder}/${fileName}`, conversationData);
    } catch (err) {
        logger.error(err);
    }


    // logger.info(`>> REPLY TO USER: ${reply}`);
    ctx.reply(coheranceReply);
}
