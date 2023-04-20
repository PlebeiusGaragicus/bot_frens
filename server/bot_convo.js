import { Configuration, OpenAIApi } from "openai";

import logger from './logger.js';
import config from './config.js';



const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// ChatGPT says: "For example, the text-davinci-003 model has a maximum token limit of 4096 tokens."
const MAX_TOKENS = 4096;



// async function sendToChatGPT(userMessage) {
//     try {

//         const response = await openai.createCompletion({
//             model: "text-davinci-003",
//             // prompt: "You: How do I combine arrays?\nJavaScript chatbot: You can use the concat() method.\nYou: How do you make an alert appear after 10 seconds?\nJavaScript chatbot",
//             prompt: `User: ${userMessage}\nAssistant:`,
//             temperature: 0.5,
//             max_tokens: 750,
//             top_p: 1.0,
//             frequency_penalty: 0.5,
//             presence_penalty: 0.0,
//             // stop: ["You:"],
//         });

//         // TODO: I need to fix my logger so it can handle objects...
//         // logger.info(response);
//         // if (config.debug)
//         // console.log(response);

//         return response.data.choices[0].text.trim();
//     } catch (error) {
//         logger.error('Error sending message to ChatGPT:', error);
//         return "I'm sorry, but I'm unable to respond at the moment.";
//     }
// }
// let conversationHistory = '';
let conversationHistory = `System: You are an AI assistant that behaves like a supportive friend, offering advice to help someone who struggles with procrastination and may have undiagnosed ADHD. You should be empathetic, understanding, and provide practical strategies for overcoming these challenges.  You should have a light and positive attitude and be conversational.\n`;


async function sendToChatGPT(userMessage) {
    try {
        // Add the user's message to the conversation history
        conversationHistory += `User: ${userMessage}\nAssistant:`;

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: conversationHistory,
            temperature: 1.2,
            max_tokens: 500,
            top_p: 1.0,
            frequency_penalty: 0.5,
            presence_penalty: 0.0,
            stop: ['\nUser', '\nAssistant'],
        });

        const reply = response.data.choices[0].text.trim();

        // Add the assistant's response to the conversation history
        conversationHistory += ` ${reply}`;

        return reply;
    } catch (error) {
        logger.error('Error sending message to ChatGPT:', error);
        return "I'm sorry, but I'm unable to respond at the moment.";
    }
}


// export async function handleUserMessage(ctx) {
//     logger.info(`handleUserMessage() - FROM: ${ctx.from.username} User ID: ${ctx.from.id}: ${ctx.message.text}`);

//     const reply = await sendToChatGPT(ctx.message.text);

//     logger.info(`handleUserMessage() - REPLY: ${reply}`);
//     ctx.reply(reply);
// }
export async function handleUserMessage(ctx) {
    logger.info(`handleUserMessage() - FROM: ${ctx.from.username} User ID: ${ctx.from.id}: ${ctx.message.text}`);

    const reply = await sendToChatGPT(ctx.message.text);

    logger.info(`handleUserMessage() - REPLY: ${reply}`);
    ctx.reply(reply);
}
