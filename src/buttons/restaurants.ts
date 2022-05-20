import { ButtonInteraction, Message, MessageActionRow, MessageButton } from "discord.js";
import restaurantAdder from "../resources/restaurants/restaurantAdder";

export default async (interaction: ButtonInteraction): Promise<void> => {
    const row = new MessageActionRow()
        .addComponents (
            new MessageButton()
                .setCustomId('view')
                .setLabel('Find Something')
                .setStyle('PRIMARY'),

            new MessageButton()
                .setCustomId('add')
                .setLabel('Add New Suggestion')
                .setStyle('PRIMARY')
        )
    
    const message = await interaction.reply({
        content: '**Welcome to resteraunt recomendations!**\n\nYou can either find somewhere to eat or drink, or add a new place for someone else to find!\ntWhat would you like to do?',
        components: [row],
        ephemeral: true,
        fetchReply: true
    })

    const collector = (message as Message).createMessageComponentCollector()

    collector.on('collect', async (btnInt: ButtonInteraction) => {
        const { customId } = btnInt;
        switch(customId) {
            case 'view':
                break;
            case 'add':
                restaurantAdder(btnInt)
                break;
        }

        const looseEnd = await btnInt.reply({
            content: 'Button Clicked...',
            fetchReply: true
        });

        (looseEnd as Message).delete()
        
    })
}