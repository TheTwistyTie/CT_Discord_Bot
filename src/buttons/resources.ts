import { ButtonInteraction, Message, MessageActionRow, MessageButton } from "discord.js"
import restaurants from "./restaurants"

export default async (interaction: ButtonInteraction): Promise<void> => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('restaurants')
                .setLabel('Restaurants')
                .setStyle('PRIMARY'),
        )

    const message = await interaction.reply({
        content: 'What would you like to find?',
        components: [row],
        ephemeral: true,
        fetchReply: true
    })

    const collector = (message as Message).createMessageComponentCollector()

    collector?.on('collect', (i: ButtonInteraction) => {
        const {customId} = i
        switch(customId){
            case 'restaurants':
                restaurants(i)
                break;
        }
    })
}
