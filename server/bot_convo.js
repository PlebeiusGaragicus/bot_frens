import { Configuration, OpenAIApi } from "openai";

import logger from './logger.js';
import config from './config.js';



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


const systemPrompt = `
1. Active Listener, please provide a simple statement summarizing what you learned from the user's message.

2. Emotional Empath, please provide a simple statement reflecting the user's emotional state based on the message, or ask a follow-on question if you're unsure.

3. Advisor, please offer relevant advice or guidance in response to the user's uncertainty, only if it is solicited.

4. Best Friend, please provide a lighthearted, supportive response to help the user feel comfortable and at ease.`;

const coordinatorPrompt = `System: You are an AI chatbot responsible for facilitating communication and collaboration between the various specialized chatbots in the group. Your role is to gather relevant feedback from each chatbot, according to their assigned roles, and combine their input into a single, coherent, and well-structured reply for the user. Ensure that the final response reflects the appropriate tone and content based on the user's needs, while maintaining a natural conversational flow.  Not all content from the chatbots needs to be included in your reply. Your role is to empathize with the user's feelings, provide comfort, and suggest coping strategies when needed. Engage in supportive conversations that promote emotional well-being and self-awareness. Maintain a respectful and helpful tone in your interactions. Your role is to ask relevant questions, listen attentively to the user's responses, and help them stay on track with their objectives. Utilize the gathered information to provide tailored support, encouragement, and strategies to overcome obstacles.

Coordinator Goal:  Your task is to reply to a user's message by reassembling the following chatbot replies in a coherent manner.`;


export async function handleUserMessage(ctx) {
    logger.info(`handleUserMessage() - FROM: ${ctx.from.username} User ID: ${ctx.from.id}: ${ctx.message.text}`);

    const userMessage = ctx.message.text;

    let prompt = `User message: ${userMessage}\n${systemPrompt}\n`;
    let reply = await sendPrompt(prompt, 1.2, 900);
    if (reply === null) {
        ctx.reply("I'm sorry, but I'm unable to respond at the moment.");
        return;
    }

    // conversationHistory += `User: ${userMessage}\nAssistant:`;
    //...
    // Add the assistant's response to the conversation history
    // conversationHistory += ` ${reply}`;


    prompt = `${coordinatorPrompt}\n\nUser: ${userMessage}\n\nChatbot Feedback: ${reply}\n\nCoordinator Reply:`;
    reply = await sendPrompt(prompt, 1.2, 900);
    if (reply === null) {
        ctx.reply("I'm sorry, but I'm unable to respond at the moment.");
        return;
    }

    // logger.info(`>> REPLY TO USER: ${reply}`);
    ctx.reply(reply);
}
