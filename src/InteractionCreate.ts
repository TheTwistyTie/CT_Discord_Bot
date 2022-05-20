import { Client, Interaction } from "discord.js";
import buttonHandler from "./buttons/buttonHandler";
import slashHandler from "./slashCommands/slashHandler";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {

            const { commandName, options } = interaction;
            slashHandler(interaction, commandName)

        } else if(interaction.isButton()) {

            const {customId} = interaction;
            buttonHandler(interaction, customId)
        }
    });
};
