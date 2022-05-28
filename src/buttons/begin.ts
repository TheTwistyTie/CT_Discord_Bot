import { ButtonInteraction, MessageActionRow, MessageButton } from "discord.js";

export default (interaction: ButtonInteraction): void => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('roles')
                .setLabel('Set Roles')
                .setStyle('PRIMARY'),

                /*
            new MessageButton()
                .setCustomId('resources')
                .setLabel('Find Somewhere New')
                .setStyle('PRIMARY')
                */
        )

    interaction.reply({
        content: 'What would you like to do?',
        components: [row],
        ephemeral: true
    })
}