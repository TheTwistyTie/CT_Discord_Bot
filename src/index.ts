import { Client} from "discord.js";
import dotenv from 'dotenv';
import mongoose from "mongoose";

import InteractionCreate from "./InteractionCreate";
import MessageCreate from "./MessageCreate";
import Ready from "./Ready";

dotenv.config();
console.log("Bot is starting...");

const client = new Client({
    intents: [
        "GUILDS", 
        "GUILD_MEMBERS", 
        "GUILD_BANS", 
        "GUILD_PRESENCES",
        "GUILD_MESSAGES", 
        "GUILD_MESSAGE_REACTIONS", 
        "DIRECT_MESSAGES",
    ] , partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

Ready(client);

MessageCreate(client)
InteractionCreate(client)

client.login(process.env.TOKEN);

console.log('Bot Online.');