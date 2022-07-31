import { BaseCommandInteraction, ButtonInteraction } from "discord.js";
import begin from "./begin";
import organizations from "./organizations";
import providers from "./providers";
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
        case 'restaurants':
            restaurants(interaction)
            break;
        case 'organizations':
            organizations(interaction)
            break;
        case 'providers':
            providers(interaction)
            break;
    }
}