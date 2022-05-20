import { Client } from "discord.js";

export default (client: Client): void => {
    client.on("messageCreate", (message) => {
        if(message.author.bot || message.channel.type == "DM") return;
        
        if (message.content === 'ping') {
            message.reply({
                content: 'pong!',
            })
        }
    })
}