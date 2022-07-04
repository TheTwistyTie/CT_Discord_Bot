import { ButtonInteraction, Message, MessageActionRow, MessageButton, SelectMenuInteraction } from "discord.js";
import RestaurantData from "./RestaurantData";
import {createResourceRec} from "./addRestaurant"
import restaurantTypeSchema from "../../schema/restaurantType-schema";

export default async (interaction: SelectMenuInteraction, resourceData: RestaurantData, messageArray: Message[]) => {
    let restaurantTypes = await restaurantTypeSchema.findOne({guildId: resourceData.guildId})

    if(!restaurantTypes) {
        restaurantTypes = new restaurantTypeSchema({
            guildId: resourceData.guildId,
            types: []
        }).save()
    }

    const msg = await interaction.reply({
        content: 'What new category of restaurant would you like to add?',
        fetchReply: true
    })

    messageArray.push(msg as Message)

    const collector = interaction.channel?.createMessageCollector({
        max: 1
    })

    collector?.on('collect', async message => {
        const value = message.content

        if(typeof restaurantTypes.types == 'undefined') {
            restaurantTypes.types = []
        }

        restaurantTypes.types.push({
            name: value,
            number: 0
        })

        restaurantTypes.save()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle('SUCCESS')
            )

        const btnMsg = await interaction.editReply({
            content: `Add Restaurant type: \'**${message.content}**\'`,
            components: [row],
        })

        const confCollector = (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', (btnInt: ButtonInteraction) => {
            createResourceRec(btnInt, resourceData, messageArray)
        })
    })


    
}