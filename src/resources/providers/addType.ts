import { ButtonInteraction, Message, MessageActionRow, MessageButton, SelectMenuInteraction } from "discord.js";
import ProviderData from "./ProviderData";
import {createResourceRec} from "./addProvider"
import providerTypeSchema from "../../schema/providerType-schema";

export default async (interaction: SelectMenuInteraction, providerData: ProviderData, messageArray: Message[]) => {
    const msg = await interaction.reply({
        content: 'What new category of provider would you like to add?',
        fetchReply: true
    })

    messageArray.push(msg as Message)

    const collector = interaction.channel?.createMessageCollector({
        max: 1
    })

    collector?.on('collect', async message => {
        const value = message.content

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle('SUCCESS')
            )

        const btnMsg = await interaction.editReply({
            content: `Add Rescource type: \'**${message.content}**\'`,
            components: [row],
        })

        const confCollector = (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', async (btnInt: ButtonInteraction) => {
            let resourceTypes = await providerTypeSchema.findOne({guildId: providerData.guildId})

            if(!resourceTypes) {
                resourceTypes = new providerTypeSchema({
                    guildId: providerData.guildId,
                    types: [{
                        name: value,
                        number: 0
                    }]
                }).save()
            } else {
                resourceTypes.types.push({
                    name: value,
                    number: 0
                })
        
                resourceTypes.save()
            }

            

            createResourceRec(btnInt, providerData, messageArray)
        })
    })


    
}