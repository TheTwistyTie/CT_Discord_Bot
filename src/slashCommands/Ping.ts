import { ApplicationCommand, BaseCommandInteraction } from "discord.js";

export default (interaction: BaseCommandInteraction): void => {
    interaction.reply({
        content: "Pong!",
        ephemeral: true
    })
}