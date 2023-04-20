import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


export default {
    debug: process.env.DEBUG || false,

    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    NOSTR_PRIVATE_KEY: process.env.NOSTR_PRIVATE_KEY,

    HUMAN_OWNER: process.env.HUMAN_OWNER,
}
