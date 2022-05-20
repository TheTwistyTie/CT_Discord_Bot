import { BaseCommandInteraction, MessageActionRow, MessageButton } from "discord.js";

export default (interaction: BaseCommandInteraction): void => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('begin')
                .setLabel('Begin')
                .setStyle('PRIMARY'),
        )

    interaction.reply({
        content: '**Welcome to the Connecticut Discord Control Panel!**\nClick the button to begin.',
        components: [row]
    })
}