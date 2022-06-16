import { Client } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import mongoose from "mongoose";
import guildIdSchema from "./schema/guildId-schema";

export default (client: Client) => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        let connection;

        await mongoose.connect(
            process.env.MONGO_URI || '', 
            { 
                keepAlive: true
            }
        ).then(() => {
            console.log('Connected to database.');
            connection = mongoose.connection;
        }).catch(err => {
            console.log(err)
        })

        const testingGuildId = '979023303916265562'
        const testingGuild = client.guilds.cache.get(testingGuildId)
        let commands
    
        if(testingGuild) {
            commands = testingGuild.commands
        } else {
            commands = client.application?.commands
        }
    
        commands?.create({
            name: 'ping',
            description: 'Replies with Pong!'
        })

        commands?.create({
            name: 'spawn',
            description: 'Spawns in the control panel. Do not use.'
        })

        commands.create({
            name: 'setup',
            description: 'Set up a new server to a defaulted template.'
        })
    
        console.log(`${client.user.username} is ready`);
    });
}