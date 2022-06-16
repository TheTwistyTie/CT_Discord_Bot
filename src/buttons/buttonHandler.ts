import { BaseCommandInteraction, ButtonInteraction } from "discord.js";
import begin from "./begin";
import resources from "./resources";
import restaurants from "./restaurants";
import roles from "./roles";

export default (interaction: ButtonInteraction, commandName: string): void => {
    switch(commandName) {
        case 'begin':
            begin(interaction)
            break;
        case 'roles':
            roles(interaction)
            break;
        case 'resources':
            resources(interaction)
            break;
    }
}