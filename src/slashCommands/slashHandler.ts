import { BaseCommandInteraction } from "discord.js";
import Ping from "./Ping";
import Setup from "./Setup";
import Spawn from "./Spawn";

export default (interaction: BaseCommandInteraction, commandName: string): void => {
    switch(commandName){
        case 'ping': 
            Ping(interaction)
            break;
        case 'spawn':
            Spawn(interaction)
            break;
        case 'setup':
            Setup(interaction)
            break;
    }
}